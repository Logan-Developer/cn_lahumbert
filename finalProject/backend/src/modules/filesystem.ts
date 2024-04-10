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

    constructor(name: string, path: string, isDirectory: boolean = false) {
        this.name = name;
        this.path = path;
        this.type = isDirectory ? MyFileTypes.DIRECTORY : this.determineFileType();
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

    determineFileType(): MyFileTypes {
        const extension = this.name.split('.').pop();

        if (!extension) {
            return MyFileTypes.GENERICFILE;
        }

        switch (extension.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return MyFileTypes.IMAGE;
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'webm':
                return MyFileTypes.VIDEO;
            case 'mp3':
            case 'wav':
            case 'flac':
            case 'ogg':
                return MyFileTypes.AUDIO;
            case 'pdf':
                return MyFileTypes.PDF;
            default:
                return MyFileTypes.GENERICFILE;
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

        if (!this.fs.existsSync(directory)) {
            return [];
        }

        const files = this.fs.readdirSync(directory);
        const fileList: MyFile[] = [];

        for (const file of files) {
            const filePath = this.path.join(directory, file);
            const relativePath = this.path.relative(userDir, filePath);

            fileList.push(new MyFile(file, relativePath, this.fs.lstatSync(filePath).isDirectory()));
        }

        return fileList;
    }

    async createUserDataFolder(username: string) {
        const userDir = this.path.join(userDirectory, username);

        if (!this.fs.existsSync(userDir)) {
            this.fs.mkdirSync(userDir, { recursive: true });
        }
    }

    async getFile(username: string, filePath: string): Promise<MyFile | null> {
        const userDir = this.path.join(userDirectory, username);
        const file = this.path.join(userDir, filePath);

        console.log('file:', file);

        if (!this.fs.existsSync(file)) {
            return null;
        }

        const completePath = userDir + '/' + filePath;
        return new MyFile(this.path.basename(file), completePath, this.fs.lstatSync(file).isDirectory());
    }

    async createDirectory(username: string, directory: string) {
        const userDir = this.path.join(userDirectory, username);
        const newDirectory = this.path.join(userDir, directory);

        if (!this.fs.existsSync(newDirectory)) {
            this.fs.mkdirSync(newDirectory, { recursive: true });
        }
    }

    getFileData(file: MyFile) {
        return this.fs.readFileSync(file.path, { encoding: 'base64' });
    }
}

export { MyFileSystem, MyFile };