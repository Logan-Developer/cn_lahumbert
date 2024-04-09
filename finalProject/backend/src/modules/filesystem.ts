import { get } from "http";

const userDirectory = __dirname + '/../../userData';

enum MyFileTypes {
    GENERICFILE = 'file',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    PDF = 'pdf',
    DIRECTORY = 'directory'
}

class MyFile {
    name: string;
    path: string;
    type: MyFileTypes;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.type = this.determineFileType(name);
    }

    getName() {
        return this.name;
    }

    getPath() {
        return this.path;
    }

    getType() {
        return this.type;
    }

    private determineFileType(name: string): MyFileTypes {
        const extension = name.split('.').pop();

        if (extension) {
            switch (extension.toLowerCase()) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                    return MyFileTypes.IMAGE;
                case 'mp4':
                case 'avi':
                case 'mov':
                    return MyFileTypes.VIDEO;
                case 'mp3':
                case 'wav':
                case 'flac':
                    return MyFileTypes.AUDIO;
                case 'pdf':
                    return MyFileTypes.PDF;
                default:
                    return MyFileTypes.GENERICFILE;
            }
        } else {
            return MyFileTypes.DIRECTORY;
        }
    }
}

class MyFileSystem {
    fs = require('fs');
    path = require('path');

    constructor() {
        // create the user data directory if it doesn't exist
        if (!this.fs.existsSync(userDirectory)) {
            this.fs.mkdirSync(userDirectory);
        }
    }

    async getUserFiles(username: string, subdirectory: string | null): Promise<MyFile[]> {
        const userDir = this.path.join(userDirectory, username);
        const directory = subdirectory ? this.path.join(userDir, subdirectory) : userDir;

        console.log('Getting files from:', directory);

        if (!this.fs.existsSync(directory)) {
            return [];
        }

        const files = this.fs.readdirSync(directory);
        const fileList: MyFile[] = [];

        for (const file of files) {
            const filePath = this.path.join(directory, file);
            const relativePath = this.path.relative(userDir, filePath);

            const isDirectory = this.fs.statSync(filePath).isDirectory();
            fileList.push(new MyFile(file, relativePath, isDirectory));
        }

        return fileList;
    }

    async createUserDataFolder(username: string) {
        const userDir = this.path.join(userDirectory, username);

        if (!this.fs.existsSync(userDir)) {
            this.fs.mkdirSync(userDir, { recursive: true });
        }
    }

    async createDirectory(username: string, directory: string) {
        const userDir = this.path.join(userDirectory, username);
        const newDirectory = this.path.join(userDir, directory);

        if (!this.fs.existsSync(newDirectory)) {
            this.fs.mkdirSync(newDirectory, { recursive: true });
        }
    }
}

export { MyFileSystem, MyFile };