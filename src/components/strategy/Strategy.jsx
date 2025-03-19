import React, { useState, useEffect } from "react";
import Header from "../common/Header";
import axios from "axios";
import { Stack, initializeIcons } from '@fluentui/react';
import CreateStrategyForm from "./CreateStrategyForm";
import StrategiesTable from "./StrategiesTable";

// Initialize FluentUI icons
initializeIcons();

const Strategy = () => {
    const [strategies, setStrategies] = useState([]);

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/strategy');
            setStrategies(response.data);
        } catch (error) {
            console.error("Error fetching strategies:", error);
        }
    };

    const handleStrategyCreated = (newStrategy) => {
        setStrategies([...strategies, newStrategy]);
    };

    return (
        <>
            <Header />
            <Stack horizontalAlign="center" styles={{ root: { margin: '0 auto', maxWidth: '1200px', padding: '20px' } }}>
                <Stack horizontal wrap styles={{ root: { width: '100%' } }}>
                    <Stack.Item grow={1} styles={{ root: { margin: '10px', minWidth: '300px' } }}>
                        <CreateStrategyForm onStrategyCreated={handleStrategyCreated} />
                    </Stack.Item>
                    
                    <Stack.Item grow={2} styles={{ root: { margin: '10px', minWidth: '500px' } }}>
                        <StrategiesTable strategies={strategies} />
                    </Stack.Item>
                </Stack>
            </Stack>
        </>
    );
};

export default Strategy;