import React, {Component} from "react";
import axios from 'axios';
 
const apiUrl = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_SERVICE_URL : 'http://localhost:5001';
 
class App extends Component {
    state = {
        message: 'start'
    }
 
    componentDidMount() {
        this.getMessage();
    }
 
    getMessage = () => {
        axios
            .get(`${apiUrl}/hello`)
            .then(res => {
                this.setState({message: `hello ${res.data.hello}`});
            })
            .catch(err => {
                console.log(err);
            });
    }
 
    render() {
        return (
            <div>
                <h1>Sample App V. 2</h1>
                <p>Message: {this.state.message}</p>
            </div>
        );
    }
}
 
export default App;