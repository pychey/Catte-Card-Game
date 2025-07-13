import React from "react";
import './LoginRegister.css';
import { FaUserAlt, FaLock} from "react-icons/fa";
import { MdEmail } from "react-icons/md";



const RegisterPage = () => {
    return (
        <div className='wrapper' >
            <div className="form-box login">
                <form className="">
                    <h1>Register</h1>

                    <div className="input-box">
                        <input type="text" placeholder="Username" required />
                        <FaUserAlt className='icon' />
                    </div>

                    <div className="input-box">
                        <input type="password" placeholder="Password" required />
                        <FaLock className='icon' />


                    </div>
                    <div className="input-box">
                        <input type="email" placeholder="Email" required />
                        <MdEmail  className='icon' />


                    </div>

                    <div className="remember-forgot">
                        <label >
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <a href="#">Forgot Password ?</a>

                    </div>
                    <button type="submit">Sign Up</button>

                    <div className="register-link">
                        <p>Already have an account ? <a href="">Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
}


export default RegisterPage;