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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const redis_1 = require("redis");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
const zod_1 = require("zod");
const bcrypt_1 = require("bcrypt");
const port = 3000;
const app = (0, express_1.default)();
const redisClient = (0, redis_1.createClient)({
    username: 'default',
    password: '1jwV1VeITPu7msIkXk1y8H0NVz71rXUq',
    socket: {
        host: 'redis-12203.c83.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 12203
    }
});
const s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const secretKey = "secret";
const userSignupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    username: zod_1.z.string()
});
dotenv_1.default.config();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const upload = (0, multer_1.default)();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.connect();
    console.log("Connected to Redis...");
}))();
function getSignedURL(key, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 60 });
        return signedUrl;
    });
}
const verifyTokenMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header is missing' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        if (typeof (decoded) === "string") {
            const data = yield db_1.default.user.findUnique({
                where: {
                    id: decoded
                }
            });
            if (!data) {
                res.status(400).json({ message: 'Unauthorized' });
                return;
            }
        }
        // @ts-ignore
        req["userId"] = decoded; // Attach decoded data to the request
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid' });
        return;
    }
});
app.post("/api/video/upload", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            res.status(401).json({ message: 'Authorization header is missing' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        const file = req.file;
        const fileId = crypto_1.default.randomUUID(); // Generate a unique file ID
        const fileKey = `videos/${fileId}-${file.originalname}`; // S3 object key
        const signedURL = yield getSignedURL(fileKey, file.mimetype);
        const url = getPublicUrl(fileKey);
        // Upload the file to S3
        yield fetch(signedURL, {
            method: "PUT",
            headers: {
                "Content-Type": file.mimetype,
            },
            body: file.buffer, // Use file.buffer for multer uploads
        });
        console.log(`File uploaded to S3: ${fileKey}`);
        // Push metadata to Redis queue
        const fileMetadata = {
            // url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file}`,
            name: file.originalname,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            key: fileKey,
            fileKey: fileId,
            userId: decoded
        };
        yield redisClient.lPush("files", JSON.stringify(fileMetadata));
        // await waitForRedisData(fileKey)
        res.json({
            message: "File uploaded successfully",
            file: fileMetadata,
            fileUrl: `${url}/720.mp4`
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "File upload failed" });
    }
}));
// const waitForRedisData = (channel: string): Promise<string> => {
//     return new Promise(async(resolve, reject) => {
//       const listener = (message: string) => {
//         redisClient.unsubscribe(channel).catch(reject); // Unsubscribe after receiving a message
//         resolve(message); // Resolve the promise with the message
//       };
//     //   redisClient.subscribe(channel).then(() => {
//     //     redisClient.on("message", (subscribedChannel, message) => {
//     //       if (subscribedChannel === channel) {
//     //         redisClient.off("message", listener); // Remove the listener to avoid memory leaks
//     //         listener(message);
//     //       }
//     //     });
//     //   }).catch(reject);
//       await redisClient.subscribe(channel, (message)=>{
//         listener(message);
//       })
//     });
//   };
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield req.body;
    const hashPassword = yield (0, bcrypt_1.hash)(body.password, 10);
    const { success } = userSignupSchema.safeParse(body);
    if (!success) {
        res.status(400).json("invaild input");
        return;
    }
    try {
        const user = yield db_1.default.user.findUnique({
            where: {
                username: body.username
            }
        });
        if (user) {
            res.status(409).json("Conflict");
            return;
        }
        const data = yield db_1.default.user.create({
            data: {
                username: body.username,
                password: hashPassword,
                email: body.email
            }
        });
        res.status(201).json({
            message: "User created successfully",
            userId: data.id,
            email: data.email
        });
        return;
    }
    catch (error) {
        res.status(500).json("internal server error");
        return;
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = yield req.body;
    const hashPassword = yield (0, bcrypt_1.hash)(password, 10);
    if (!email || !password) {
        res.status(400).json("Bad Request");
    }
    try {
        const data = yield db_1.default.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                password: true
            }
        });
        if (data && (yield (0, bcrypt_1.compare)(password, data.password))) {
            const token = jsonwebtoken_1.default.sign(data.id, secretKey);
            res.status(200).json({
                token: token,
                userId: data.id
            });
            return;
        }
        res.status(401).json("Unauthorized");
    }
    catch (error) {
        res.status(500).json("internal server error");
    }
}));
app.post("/api/v1/create-room", verifyTokenMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, videoUrl } = yield req.body;
    const processId = crypto_1.default.randomUUID() + Date.now().toString();
    const sessionId = generateId();
    // const payload = `${sessionId}_${videoUrl}`
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header is missing' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jsonwebtoken_1.default.verify(token, secretKey);
    const userData = yield db_1.default.user.findUnique({
        where: {
            id: decoded
        }
    });
    const payload = `${userData === null || userData === void 0 ? void 0 : userData.username}_${videoUrl}`;
    const roomToken = jsonwebtoken_1.default.sign(payload, secretKey);
    yield redisClient.lPush("room", JSON.stringify({ type: "CREATE", roomId: sessionId, roomToken: roomToken, processId: processId }));
    res.json({
        roomToken: roomToken,
        roomId: sessionId
    });
}));
app.post("/api/v1/join-room", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, name } = yield req.body;
    const payload = `${roomId}_PART`;
    // const token: string = jwt.sign(payload, secretKey);
    // const roomToken: string = jwt.sign(payload, secretKey);
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header is missing' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jsonwebtoken_1.default.verify(token, secretKey);
    const userData = yield db_1.default.user.findUnique({
        where: {
            id: decoded
        }
    });
    const roomToken = jsonwebtoken_1.default.sign((userData === null || userData === void 0 ? void 0 : userData.username) || "", secretKey);
    yield redisClient.lPush("join-room", JSON.stringify({ type: "CREATE", roomId: roomId, roomToken: roomToken }));
    res.json({
        roomToken: roomToken
    });
}));
app.get("/api/v1/get-videos", verifyTokenMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header is missing' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const userId = jsonwebtoken_1.default.verify(token, secretKey);
    const data = yield db_1.default.video.findMany({
        where: {
            userId: userId
        },
        select: {
            id: true,
            name: true,
            thumbnailUrl: true,
            url: true
        }
    });
    res.json({
        videos: data
    });
}));
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
const getPublicUrl = (key) => {
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
const generateId = () => {
    const generateSegment = () => {
        return Array.from({ length: 3 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    };
    return `${generateSegment()}-${generateSegment()}-${generateSegment()}`;
};
