import axios from 'axios';

export default class ApiRequest {
    static axiosInstance = axios.create({
        baseURL: 'http://localhost:5000/',
        headers: {
            "Content-type": "application/json",
        }
    })

    static async createPuzzle() {
        const body = {
        }

        let response = await ApiRequest.axiosInstance.post('createPuzzle', body)
            .then(function (response) {
                // console.log(response.data);
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
                return {};
            });

        return response;
    }



}