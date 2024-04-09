const userDirectory = __dirname + '/../../userData';

class MyFile {
    name: string;
    path: string;
    isDirectory: boolean;

    constructor(name: string, path: string, isDirectory: boolean) {
        this.name = name;
        this.path = path;
        this.isDirectory = isDirectory;
    }

    getName() {
        return this.name;
    }

    getPath() {
        return this.path;
    }

    getIsDirectory() {
        return this.isDirectory;
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