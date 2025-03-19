import React, { useState, useEffect } from "react";
import slick from 'slick-carousel'
import axios from "axios";
import Slider from "react-slick";
import Carousel from 'react-elastic-carousel';
import Item from "./Item";

const Category = (props) => {

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1
    };
    
    if (props.value == null || props.value.movies == null) {
        
     
        return (
            <div></div>
        );
    }

    return (
        <div className="col-12">
            <h1>{props.value.Name}</h1>
                        <Carousel itemsToShow={4}>

                {props.value.movies && props.value.movies.map((value) => {
                    console.log(value)
                    return (
                        <Item key={value.key} url={value.ImageUrl} href={"movie/" + value._id}>
                            <i className="fas fa-star s1 ratingStar">
                                <span className="ratingStarNumber">
                                    5
                                </span>
                            </i>
                        </Item>
                    );
                })}
                
                </Carousel>
        </div>
    );
};


export default Category;
