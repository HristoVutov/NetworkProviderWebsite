import React, { useState, useEffect } from "react";
import Header from "../common/Header";
import axios from "axios";
import { Stack, initializeIcons } from '@fluentui/react';
import CreateTradingAccountForm from "./CreateTradingAccountForm";
import TradingAccountsTable from "./TradingAccountsTable";
import AssignStrategiesModal from "./AssignStrategiesModal";

// Initialize FluentUI icons
initializeIcons();

const Account = () => {
    const [accounts, setAccounts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/tradingAccount');
            setAccounts(response.data);
        } catch (error) {
            console.error("Error fetching trading accounts:", error);
        }
    };

    const handleAccountCreated = (newAccount) => {
        setAccounts([...accounts, newAccount]);
    };
    
    const handleAccountSelected = (account) => {
        console.log("Account selected:", account);
        setSelectedAccount(account);
        setIsModalOpen(true);
    };
    
    const handleModalDismiss = () => {
        setIsModalOpen(false);
        setSelectedAccount(null);
    };
    
    const handleStrategiesAssigned = () => {
        // Refresh the accounts list after strategies are assigned
        fetchAccounts();
    };

    return (
        <>
            <Header />
            <Stack horizontalAlign="center" styles={{ root: { margin: '0 auto', maxWidth: '1200px', padding: '20px' } }}>
                <Stack horizontal wrap styles={{ root: { width: '100%' } }}>
                    <Stack.Item grow={1} styles={{ root: { margin: '10px', minWidth: '300px' } }}>
                        <CreateTradingAccountForm onAccountCreated={handleAccountCreated} />
                    </Stack.Item>
                    
                    <Stack.Item grow={2} styles={{ root: { margin: '10px', minWidth: '500px' } }}>
                        <TradingAccountsTable 
                            accounts={accounts} 
                            onAccountSelected={handleAccountSelected}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
            
            {selectedAccount && (
                <AssignStrategiesModal
                    isOpen={isModalOpen}
                    onDismiss={handleModalDismiss}
                    selectedAccount={selectedAccount}
                    onStrategiesAssigned={handleStrategiesAssigned}
                />
            )}
        </>
    );
};

export default Account;