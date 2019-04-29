import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-my-burger-4c6eb.firebaseio.com/'
});

export default instance;
