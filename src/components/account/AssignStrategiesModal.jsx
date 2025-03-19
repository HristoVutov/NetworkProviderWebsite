import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  PrimaryButton,
  DefaultButton,
  Stack,
  Text,
  Dropdown,
  MessageBar,
  MessageBarType,
  mergeStyleSets
} from '@fluentui/react';

const styles = mergeStyleSets({
  modal: {
    maxWidth: '500px',
    minWidth: '320px',
  },
  header: {
    marginBottom: '20px',
  },
  form: {
    width: '100%',
  },
  buttonsContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: '10px',
  }
});

const AssignStrategiesModal = ({ isOpen, onDismiss, selectedAccount, onStrategiesAssigned }) => {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategyIds, setSelectedStrategyIds] = useState([]);
  const [existingStrategyIds, setExistingStrategyIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen && selectedAccount) {
      fetchStrategies();
      
      // Parse the existing strategy IDs
      const existingIds = selectedAccount.strategyIds 
        ? selectedAccount.strategyIds.split(',').filter(id => id.trim() !== '')
        : [];
      console.log("existingIds",existingIds)
      setExistingStrategyIds(existingIds);
      setSelectedStrategyIds(existingIds);
    }
  }, [isOpen, selectedAccount]);

  const fetchStrategies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/strategy');
      setStrategies(response.data);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      setError("Error fetching strategies. Please try again.");
    }
  };

  const handleStrategyChange = (event, item) => {
    setSelectedStrategyIds(
      item.selected 
        ? [...selectedStrategyIds, item.key] 
        : selectedStrategyIds.filter(id => id !== item.key)
    );
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !selectedAccount.id) {
      setError("No trading account selected.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");
    
    // Find new strategy IDs that were not previously assigned
    const newStrategyIds = selectedStrategyIds.filter(id => !existingStrategyIds.includes(id));
    
    if (newStrategyIds.length === 0) {
      setSuccess("No new strategies to assign.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Send a request for each new strategy
      for (const strategyId of newStrategyIds) {
        await axios.put(`http://localhost:3001/api/tradingAccounts/${selectedAccount.id}/strategy/${strategyId}`);
      }
      
      setSuccess("Strategies assigned successfully!");
      onStrategiesAssigned();
      
      // Close modal after a short delay
      setTimeout(() => {
        onDismiss();
      }, 1500);
    } catch (error) {
      console.error("Error assigning strategies:", error);
      setError("Error assigning strategies: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare dropdown options
  const dropdownOptions = strategies.map(strategy => ({
    key: strategy._id,
    text: strategy.Name
  }));

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      isBlocking={false}
      containerClassName={styles.modal}
    >
      <Stack tokens={{ childrenGap: 15 }} styles={{ root: { padding: '20px' } }}>
        <Text variant="xLarge" className={styles.header}>Assign Strategies</Text>
        
        {selectedAccount && (
          <Text>Trading Account: {selectedAccount.name}</Text>
        )}
        
        {error && (
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
          >
            {error}
          </MessageBar>
        )}
        
        {success && (
          <MessageBar
            messageBarType={MessageBarType.success}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
          >
            {success}
          </MessageBar>
        )}
        
        <form className={styles.form}>
          <Dropdown
            label="Select Strategies"
            multiSelect
            options={dropdownOptions}
            selectedKeys={selectedStrategyIds}
            onChange={handleStrategyChange}
            disabled={isSubmitting}
          />
          
          <Stack horizontal className={styles.buttonsContainer}>
            <DefaultButton
              text="Cancel"
              onClick={onDismiss}
              className={styles.button}
              disabled={isSubmitting}
            />
            <PrimaryButton
              text={isSubmitting ? "Assigning..." : "Assign"}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={styles.button}
            />
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default AssignStrategiesModal;