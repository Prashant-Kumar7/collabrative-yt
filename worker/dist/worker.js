"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
// import Ffmpeg from "fluent-ffmpeg";
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const lib_storage_1 = require("@aws-sdk/lib-storage");
const fs_extra_1 = __importDefault(require("fs-extra"));
// import ffmpeg from "fluent-ffmpeg";
// import Ffmpeg from "fluent-ffmpeg";
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const db_1 = __importDefault(require("./db"));
// ffmpeg.setFfmpegPath("../node_modules/fluent-ffmpeg"); 
dotenv_1.default.config();
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const client = (0, redis_1.createClient)({
    username: 'default',
    password: 'sHyvGNlJNQyPof6qaQSrBvpv0k6pxwv3',
    socket: {
        host: 'redis-12075.c114.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 12075
    }
});
function startWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("Connected to Redis...");
            while (true) {
                console.log("Waiting for files...");
                const item = yield client.brPop("files", 0); // Blocking pop
                if (!item)
                    continue;
                const file = JSON.parse(item.element);
                const params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: file.key };
                const command = new client_s3_1.GetObjectCommand(params);
                const outputDir = "./output/";
                // Get the S3 object
                const response = yield s3Client.send(command);
                // Check if Body is a stream
                if (!response.Body) {
                    throw new Error("No response body received.");
                }
                const bodyStream = response.Body;
                const fileStream = fs_1.default.createWriteStream(`./${file.name}`);
                // Pipe the stream to a file
                yield new Promise((resolve, reject) => {
                    bodyStream.pipe(fileStream);
                    bodyStream.on("error", reject);
                    fileStream.on("finish", resolve);
                });
                console.log(`video downloaded to ./${file.name}`);
                yield s3Client.send(new client_s3_1.DeleteObjectCommand(params));
                if (!fs_1.default.existsSync(outputDir)) {
                    fs_1.default.mkdirSync(outputDir, { recursive: true });
                }
                yield runFFmpegCommand(`./${file.name}`, `./output/`).then(() => console.log("Video scaled successfully")).catch((err) => console.error("Error:", err));
                console.log(`File ${file.name} transcoded successfully.`);
                const bucketName = 'csv-upload-22990'; // Replace with your S3 bucket name
                const localFolder = './output'; // Replace with your folder path
                const s3Folder = `${file.fileKey}`; // Replace with your desired S3 folder key
                yield uploadFolderToS3(bucketName, localFolder, s3Folder);
                const fileUrl = `https://csv-upload-22990.s3.ap-south-1.amazonaws.com/${file.fileKey}`;
                const thumbnailUrl = `https://csv-upload-22990.s3.ap-south-1.amazonaws.com/${file.fileKey}/thumbnail.jpg`;
                yield deleteFile(file.name);
                // await client.publish(file.key, JSON.stringify("process done"))
                yield db_1.default.video.create({
                    data: {
                        name: file.name,
                        url: fileUrl,
                        userId: file.userId,
                        thumbnailUrl: thumbnailUrl
                    }
                });
            }
        }
        catch (error) {
            console.error("Error in worker:", error);
        }
        finally {
            yield client.disconnect();
        }
    });
}
function runFFmpegCommand(inputFile, outputFile) {
    const command = `ffmpeg -i ${inputFile} -vf scale=1280:720 ${outputFile}720p.mp4 -vf scale=854:480 ${outputFile}480p.mp4 -vf scale=640:360 ${outputFile}360p.mp4 && ffmpeg -ss 00:00:05 -i ${inputFile} -vframes 1 ${outputFile}thumbnail.jpg
`;
    // const command = "ffmpeg"
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Stderr: ${stderr}`);
                return;
            }
            console.log("FFmpeg Output:", stdout);
            resolve();
        });
    });
}
function uploadFolderToS3(bucketName, folderPath, s3Folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield fs_extra_1.default.readdir(folderPath);
        for (const file of files) {
            const filePath = path_1.default.join(folderPath, file);
            // Check if it's a file or a folder
            const stat = yield fs_extra_1.default.stat(filePath);
            if (stat.isFile()) {
                // Upload file
                const s3Key = path_1.default.join(s3Folder, file).replace(/\\/g, '/'); // S3 uses forward slashes
                yield uploadFileToS3(bucketName, filePath, s3Key);
            }
            else if (stat.isDirectory()) {
                // Recursively upload sub-folder
                const subFolder = path_1.default.join(s3Folder, file).replace(/\\/g, '/'); // S3 uses forward slashes
                yield uploadFolderToS3(bucketName, filePath, subFolder);
            }
        }
    });
}
function uploadFileToS3(bucketName, filePath, s3Key) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileStream = fs_1.default.createReadStream(filePath);
        const upload = new lib_storage_1.Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: s3Key,
                Body: fileStream,
            },
        });
        yield upload.done();
        console.log(`Uploaded: ${filePath} to ${s3Key}`);
    });
}
function deleteFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.unlink(`./${filePath}`);
            console.log(`Deleted file: ./${filePath}`);
        }
        catch (error) {
            console.error(`Error deleting file: ${"./downloaded-file.pdf"}`, error);
        }
        try {
            yield promises_1.default.rm('./output', { recursive: true, force: true });
            console.log(`Deleted folder: ${'./output'}`);
        }
        catch (error) {
            console.error(`Error deleting folder: ${'./output'}`, error);
        }
    });
}
// Start the worker
startWorker();
