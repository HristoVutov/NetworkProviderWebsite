
import React, { useRef, useState, useEffect } from "react";
import Header from "../common/Header";
import "../../assets/style/login.css";
import { useAuthContextProvider } from '../contexts/AuthContext'
import axios from "axios";
import Category from "./Category";
import { InputGroup } from "react-bootstrap";

const Movie = () => {
    const ratingRef = useRef();
    const descriptionRef = useRef();
    const { currentUser } = useAuthContextProvider();
    const [error, setError] = useState("");
    const [movie, setMovie] = useState();
    const [currentId, setCurrenntId] = useState();
    const [rating, setRating] = useState();

    function hasText(e) {
        if (e.target.tagName == "SELECT") {
            if (e.target[e.target.selectedIndex].text != "")
                e.target.classList.add('hasText')
            else
                e.target.classList.remove('hasText')
        } else {
            if (e.target.value != "")
                e.target.classList.add('hasText')
            else
                e.target.classList.remove('hasText')
        }
    }

    function onChangeValue(event) {
        console.log(event, event.target.value)
        setRating(event.target.value);
    }


    function handleSubmit(e) {
        e.preventDefault();

        let user = JSON.parse(window.localStorage.getItem('user'))

        axios.post('http://localhost:3001/api/movies/' + currentId, {
            rating: rating,
            comment: descriptionRef.current.value,
        }, {
            headers: {
                'auth-token': user['auth-token']
            }
        })
            .then(function (response) {
                let comments = [...movie.Comments]
                comments.push(response.data)

                setMovie({ ...movie, Comments: comments })

                descriptionRef.current.value = "";

                const parent =  document.getElementById('rating-el');
                for (const child of parent.children) {
                    if (child.tagName == "INPUT") {
                        child.checked = false

                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });


    }

    useEffect(() => {
        let split = window.location.toString().split('/')
        let id = split[split.length - 1]
        setCurrenntId(id);
        let isSubscribed = true;

        async function fetchCategoriesData(id) {
            const movie = await axios.get('http://localhost:3001/api/movies/' + id)
            const movieData = await movie.data;

            setMovie(movieData);
        }

        fetchCategoriesData(id).catch(console.error);

        return () => isSubscribed = false;
    }, []);

    return (
        <>
            <Header />
            <div className="container-medium">
                <div className="login-wrapper hybrid-login-wrapper">
                    <div className="">
                        <div className="login-content login-form hybrid-login-form hybrid-login-form-signup" data-uia="login-page-container">
                            <div class="hybrid-login-form-main">

                                <div className="row">
                                    <div className="col-md-5">
                                        <img src={movie && movie.ImageUrl} className="movie-img" />
                                    </div>
                                    <div className="col-md-7">
                                        <h1>{movie && movie.Title}</h1>
                                        <span>{movie && movie.Description}</span>
                                    </div>
                                </div>
                                {
                                    movie && (currentUser.RoleId == 3 || movie.User == currentUser.Id) ?
                                        <div className="row">
                                            <a href={"/edit-movie/" + movie._id} class="btn login-button btn-submit btn-small btn-edit">Edit</a>
                                        </div>
                                        : <div></div>
                                }
                                <div className="row mt-125">
                                    <div className="col-md-12">
                                        <h1>Comments and Ratings</h1>
                                    </div>
                                    {movie && movie.Comments &&
                                        movie.Comments.map((value) => {

                                            return (
                                                <div className="col-md-12 comment-section mt-15">
                                                    <h2 className="inline">{value.UserName}</h2>
                                                    <div class="rating rating-comment">
                                                        <input name="stars" type="radio" value="5" disabled="disabled" checked={value.Rating == 5} /><label for="e5">☆</label>
                                                        <input name="stars" type="radio" value="4" disabled="disabled" checked={value.Rating == 4} /><label for="e4">☆</label>
                                                        <input name="stars" type="radio" value="3" disabled="disabled" checked={value.Rating == 3} /><label for="e3">☆</label>
                                                        <input name="stars" type="radio" value="2" disabled="disabled" checked={value.Rating == 2} /><label for="e2">☆</label>
                                                        <input name="stars" type="radio" value="1" disabled="disabled" checked={value.Rating == 1} /><label for="e1">☆</label>
                                                    </div><br />
                                                    <span className="mt-15 comment-span">{value.Comment}</span>
                                                </div>
                                            );
                                        })
                                    }

                                </div>
                                <div className="row">
                                    {currentUser.RoleId > 0 ?
                                        <form action="" onSubmit={handleSubmit}>
                                            <div className="col-md-12">
                                                <h1 className="inline">Leave comment and rating</h1>
                                                <div class="rating" id="rating-el" onChange={onChangeValue}>
                                                    <input name="stars" id="e5" type="radio" value="5" /><label for="e5">☆</label>
                                                    <input name="stars" id="e4" type="radio" value="4" /><label for="e4">☆</label>
                                                    <input name="stars" id="e3" type="radio" value="3" /><label for="e3">☆</label>
                                                    <input name="stars" id="e2" type="radio" value="2" /><label for="e2">☆</label>
                                                    <input name="stars" id="e1" type="radio" value="1" /><label for="e1">☆</label>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mt-15">
                                                <div class="nfInput nfPasswordInput login-input login-input-password">
                                                    <div class="nfInputPlacement">
                                                        <div class="nfPasswordControls" style={{ width: "100%" }}>
                                                            <label class="input_id" placeholder="">
                                                                <textarea class="nfTextField textAreaCust" rows="4" onChange={hasText} ref={descriptionRef} cols="4" tabindex="1"></textarea>
                                                                <label class="placeLabel placeLabelArea">Comment</label>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button class="btn login-button btn-submit btn-small" type="submit" autocomplete="off" tabindex="0" data-uia="login-submit-button">Submit</button>
                                            </div>
                                        </form>
                                        :
                                        <div></div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Movie;
