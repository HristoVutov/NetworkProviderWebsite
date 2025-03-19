
import React, { useRef, useState, useEffect } from "react";
import Header from "../common/Header";
import "../../assets/style/login.css";
import { useAuthContextProvider } from '../contexts/AuthContext'
import axios from "axios";
import Category from "./Category";
import  { useHistory  } from 'react-router-dom'

const CreateMovie = () => {
    const titleRef = useRef();
    const descriptionRef = useRef();
    const categoryRef = useRef();
    const imageUrlRef = useRef();
    const { login } = useAuthContextProvider();
    const [error, setError] = useState("");
    const [categories, setCategories] = useState();
    const history = useHistory(); 

    function hasText(e){
        console.log(e)
        if(e.target.tagName == "SELECT"){
            if(e.target[e.target.selectedIndex].text != "")
                e.target.classList.add('hasText')
            else
                e.target.classList.remove('hasText')
        }else{
            if(e.target.value != "")
                e.target.classList.add('hasText')
            else
                e.target.classList.remove('hasText')
        }
        
        
    }

    function handleSubmit(e){
        e.preventDefault();
        
        let user = JSON.parse(window.localStorage.getItem('user'))

        axios.post('http://localhost:3001/api/movies', {
            title: titleRef.current.value,
            description: descriptionRef.current.value,
            category: categoryRef.current.value,
            ImageUrl: imageUrlRef.current.value,
          },{
            headers:{
                'auth-token': user['auth-token']
            }
          })
          .then(function (response) {
            history.push("/movie/" + response.data._id);
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
       

    }

    useEffect(() => {
        console.log("Use Effect")
        let isSubscribed = true;

        async function fetchCategoriesData() {
            const categories = await axios.get('http://localhost:3001/api/categories')
            const catData = await categories.data;          
            
            setCategories(catData);
        }

        fetchCategoriesData().catch(console.error);

        return () => isSubscribed = false;
    }, []);

    return (
        <>
            <Header />
            <div className="container">
            <div className="login-wrapper hybrid-login-wrapper">
            <div className="">
                <div className="login-content login-form hybrid-login-form hybrid-login-form-signup" data-uia="login-page-container">
                    <div class="hybrid-login-form-main">
                        <h1 data-uia="login-page-title">Create Movie</h1>
                        <form method="post" class="login-form" action="" onSubmit={handleSubmit}>   
                        <div class="nfInput nfPasswordInput login-input login-input-password">
                                <div class="nfInputPlacement">
                                    <div class="nfPasswordControls">
                                        <label class="input_id" placeholder="">
                                            <input type="text" class="nfTextField" onChange={hasText} ref={titleRef} tabindex="0" />
                                            <label class="placeLabel">Title</label>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="nfInput nfPasswordInput login-input login-input-password">
                                <div class="nfInputPlacement">
                                    <div class="nfPasswordControls">
                                        <label class="input_id" placeholder="">
                                            <textarea class="nfTextField" rows="4" onChange={hasText} ref={descriptionRef} cols="4" tabindex="1"></textarea>                                            
                                            <label class="placeLabel">Description</label>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="nfInput nfPasswordInput login-input login-input-password">
                                <div class="nfInputPlacement">
                                    <div class="nfPasswordControls">
                                        <label class="input_id" placeholder="">
                                        <input type="text" class="nfTextField" onChange={hasText} ref={imageUrlRef} tabindex="2" />                                         
                                            <label class="placeLabel">Image URL</label>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="nfInput nfPasswordInput login-input login-input-password">
                                <div class="nfInputPlacement">
                                    <div class="nfPasswordControls">
                                        <label class="input_id" placeholder="">
                                        <select class="nfTextField" onChange={hasText} ref={categoryRef}>
                                            <option value="0"></option>
                                            {categories && categories.map((value) => {
                    
                                                return (
                                                    <option value={value._id}>{value.Name}</option>
                                                );
                                            })}
                                            </select>                                      
                                            <label class="placeLabel">Category</label>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button class="btn login-button btn-submit btn-small" type="submit" autocomplete="off" tabindex="0" data-uia="login-submit-button">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            </div>
            </div>
      
        </>
    );
};

export default CreateMovie;
