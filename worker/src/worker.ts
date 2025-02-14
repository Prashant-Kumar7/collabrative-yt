import { createClient } from "redis";
// import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import dotenv from "dotenv"
import { Upload } from '@aws-sdk/lib-storage';
import fsExtra from 'fs-extra';
// import ffmpeg from "fluent-ffmpeg";
// import Ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import fsPromises from 'fs/promises';
import prisma from "./db";

// ffmpeg.setFfmpegPath("../node_modules/fluent-ffmpeg"); 

dotenv.config()

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
const client = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
      host: process.env.REDIS_HOST,
      port: 12203
  }
});

async function startWorker() {
    try {
        await client.connect();
        console.log("Connected to Redis...");

        while (true) {
            console.log("Waiting for files...");
            const item = await client.brPop("files", 0); // Blocking pop
            if (!item) continue;

            const file: { key: string; bucket: string; name: string; fileKey :string; userId : string } = JSON.parse(item.element);

            const params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: file.key };
            const command = new GetObjectCommand(params);
            const outputDir = "./output/"
          
            // Get the S3 object
            const response = await s3Client.send(command);
          
            // Check if Body is a stream
            if (!response.Body) {
              throw new Error("No response body received.");
            }
          
            const bodyStream = response.Body as Readable;
          
            const fileStream = fs.createWriteStream(`./${file.name}`);
          
            // Pipe the stream to a file
            await new Promise<void>((resolve, reject) => {
              bodyStream.pipe(fileStream);
              bodyStream.on("error", reject);
              fileStream.on("finish", resolve);
            });

            console.log(`video downloaded to ./${file.name}`);
            await s3Client.send(new DeleteObjectCommand(params));

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            await runFFmpegCommand(`./${file.name}`, `./output/`).then(() => console.log("Video scaled successfully")).catch((err) => console.error("Error:", err));

            console.log(`File ${file.name} transcoded successfully.`);
            const bucketName = 'csv-upload-22990'; // Replace with your S3 bucket name
            const localFolder = './output'; // Replace with your folder path
            const s3Folder = `${file.fileKey}`; // Replace with your desired S3 folder key
            await uploadFolderToS3(bucketName, localFolder, s3Folder);

            const fileUrl = `https://csv-upload-22990.s3.ap-south-1.amazonaws.com/${file.fileKey}`
            const thumbnailUrl = `https://csv-upload-22990.s3.ap-south-1.amazonaws.com/${file.fileKey}/thumbnail.jpg`
            await deleteFile(file.name)
            // await client.publish(file.key, JSON.stringify("process done"))
            await prisma.video.create({
              data : {
                name : file.name,
                url : fileUrl,
                userId : file.userId,
                thumbnailUrl : thumbnailUrl
              }
            })
        }
    } catch (error) {
        console.error("Error in worker:", error);
    } finally {
        await client.disconnect();
    }
}

function runFFmpegCommand(inputFile: string, outputFile: string) {
    const command = `ffmpeg -i ${inputFile} -vf scale=1280:720 ${outputFile}720p.mp4 -vf scale=854:480 ${outputFile}480p.mp4 -vf scale=640:360 ${outputFile}360p.mp4 && ffmpeg -ss 00:00:05 -i ${inputFile} -vframes 1 ${outputFile}thumbnail.jpg
`;
    // const command = "ffmpeg"
  
    return new Promise<void>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
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


  async function uploadFolderToS3(bucketName: string, folderPath: string, s3Folder: string): Promise<void> {
    const files = await fsExtra.readdir(folderPath);
  
    for (const file of files) {
      const filePath = path.join(folderPath, file);
  
      // Check if it's a file or a folder
      const stat = await fsExtra.stat(filePath);
  
      if (stat.isFile()) {
        // Upload file
        const s3Key = path.join(s3Folder, file).replace(/\\/g, '/'); // S3 uses forward slashes
        await uploadFileToS3(bucketName, filePath, s3Key);
      } else if (stat.isDirectory()) {
        // Recursively upload sub-folder
        const subFolder = path.join(s3Folder, file).replace(/\\/g, '/'); // S3 uses forward slashes
        await uploadFolderToS3(bucketName, filePath, subFolder);
      }
    }
  }

  async function uploadFileToS3(bucketName: string, filePath: string, s3Key: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath);
  
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileStream,
      },
    });
  
    await upload.done();
    console.log(`Uploaded: ${filePath} to ${s3Key}`);
  }


  async function deleteFile(filePath : string) {
    try {
      await fsPromises.unlink(`./${filePath}`);
      console.log(`Deleted file: ./${filePath}`);
    } catch (error) {
      console.error(`Error deleting file: ${"./downloaded-file.pdf"}`, error);
    }
  
    try {
      await fsPromises.rm('./output', { recursive: true, force: true });
      console.log(`Deleted folder: ${'./output'}`);
    } catch (error) {
      console.error(`Error deleting folder: ${'./output'}`, error);
    }
  }

// Start the worker
startWorker();
