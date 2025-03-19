import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  PrimaryButton,
  Stack,
  Text,
  MessageBar,
  MessageBarType,
  mergeStyleSets
} from '@fluentui/react';

// Styles for the component
const styles = mergeStyleSets({
  container: {
    maxWidth: '500px',
    padding: '20px',
    background: '#f8f8f8',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: '20px',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: '20px',
  }
});

// Component for creating a new trading account
const CreateTradingAccountForm = ({ onAccountCreated }) => {
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e, newValue) => {
    setAccountName(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!accountName.trim()) {
      setError("Account name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    axios.post('http://localhost:3001/api/tradingAccount', {
      name: accountName
    })
    .then(function (response) {
      if (response.status === 201) {
        onAccountCreated(response.data);
        setAccountName("");
      }
    })
    .catch(function (error) {
      setError("Error creating trading account: " + (error.response?.data?.message || error.message));
      console.log(error);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <Stack className={styles.container}>
      <Text variant="xLarge" className={styles.title}>Create Trading Account</Text>
      
      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
          styles={{ root: { marginBottom: '15px' } }}
        >
          {error}
        </MessageBar>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          label="Account Name"
          value={accountName}
          onChange={handleNameChange}
          required
          placeholder="Enter account name"
          autoComplete="off"
        />
        
        <PrimaryButton
          text="Create Account"
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        />
      </form>
    </Stack>
  );
};

export default CreateTradingAccountForm;