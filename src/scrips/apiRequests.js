import axios from 'axios';

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

        let response = await ApiRequest.axiosInstance.post('createPuzzle', dataToSend)
            .then(function (response) {
                return {'code': response.status }
                // return response.data;

            })
            .catch(function (error) {
                console.log(error);
                const data = new Object();
                if (error.response) {
                    data['code'] = error.response.status;
                    console.log(error.response.status)
                }
                return data;
            });

        return response;
    }



}