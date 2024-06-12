import axios from 'axios';

export default class ApiRequest {
    static axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/',
        headers: {
            "Content-type": "application/json",
        }
    })

    static async createPuzzle(size) {
        const body = {
            puzzleSize: {rows: size.rows, columns: size.columns}
        }

        let response = await ApiRequest.axiosInstance.post('createPuzzle', body)
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