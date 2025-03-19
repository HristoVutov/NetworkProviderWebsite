import React, { useRef, useState, useEffect } from "react";
import Header from "../common/Header";
import "../../assets/style/login.css";
import { useAuthContextProvider } from '../contexts/AuthContext'
import axios from "axios";
import { Alert } from "bootstrap";
import Category from "./Category";
import { isValidDateValue } from "@testing-library/user-event/dist/utils";

const Movies = () => {
    const [items, setItems] = useState();

    useEffect(() => {
        console.log("Use Effect")
        let isSubscribed = true;

        async function fetchCategoriesData() {
            const categories = await axios.get('http://localhost:3001/api/categories')
            const catData = await categories.data;

            // console.log(catData)
            for (let index = 0; index < catData.length; index++) {
                const element = catData[index];
                catData[index].key = index
                
                const response = await axios.get('http://localhost:3001/api/categories/' + element._id)
                const data = await response.data
                for (let j = 0; j < data.length; j++) {
                    data[j].key = j + 1;
                }
                
                catData[index].movies = data.length == 0 ? null : data;

            }

            if (isSubscribed) {
                console.log("Inside")
                setItems(catData)
            }
        }

        fetchCategoriesData().catch(console.error);

        return () => isSubscribed = false;
    }, []);

    return (
        <>
            <Header />
            <div className="container">
            {
                items &&
                items.map((value) => {
                    
                      return (
                        <Category value={value} category={value.Name}/>
                      );
                })
            }
            </div>
        </>
    );
};

export default Movies;
