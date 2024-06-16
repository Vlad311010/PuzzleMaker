import axios from 'axios';
import JSZip from 'jszip';

export default class ApiRequest {
    static axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/',
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    static async createPuzzle(formData) {
        const body = {
            puzzleSize: {rows: formData.rows, columns: formData.columns},
            image: formData.image,
            scale: formData.scale
        }

        const dataToSend = new FormData();
        dataToSend.append('image', formData.image);
        dataToSend.append('data', JSON.stringify(body));

        
        let response = await ApiRequest.axiosInstance.post('createPuzzle', dataToSend, { responseType: 'blob' })
            .then(async function (response) {
                const files = await ApiRequest.handleZipFile(response.data);
                return {'code': response.status, 'files': files};
            })
            .catch(function (error) {
                console.log(error);
                const data = {};
                if (error.response) {
                    data['code'] = error.response.status;
                    console.log(error.response.status)
                }
                return data;
            });

        return response;
    }

    static async handleZipFile(file) {
        const zip = new JSZip();
        
        try {
            const files = new Object();
            const content = await zip.loadAsync(file);
            const filePromises = Object.entries(content.files)
            .map(async ([relativePath, file]) => {
                const type = file.name.split('.')[1] === 'json' ? 'string' : 'base64';
                const fileContent = await file.async(type);
                console.log(fileContent);
                files[file.name.split('.')[0]] = fileContent;
            });

            await Promise.all(filePromises);
            return files;
        } catch (err) {
            console.error("Error reading zip file:", err);
            return null;
        }
    }


}