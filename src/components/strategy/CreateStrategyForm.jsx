import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  PrimaryButton,
  Stack,
  Text,
  Checkbox,
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
  },
  checkbox: {
    marginTop: '15px',
    marginBottom: '15px',
  }
});

// Component for creating a new strategy
const CreateStrategyForm = ({ onStrategyCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    parameters: "",
    skipChecksTakeTrade: false
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (fieldName) => (e, newValue) => {
    setFormData({
      ...formData,
      [fieldName]: newValue
    });
  };

  const handleCheckboxChange = (e, checked) => {
    setFormData({
      ...formData,
      skipChecksTakeTrade: checked
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Strategy name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    axios.post('http://localhost:3001/api/strategy', {
      name: formData.name,
      url: formData.url,
      parameters: formData.parameters,
      skipChecksTakeTrade: formData.skipChecksTakeTrade
    })
    .then(function (response) {
      if (response.status === 201) {
        onStrategyCreated(response.data);
        setFormData({
          name: "",
          url: "",
          parameters: "",
          skipChecksTakeTrade: false
        });
      }
    })
    .catch(function (error) {
      setError("Error creating strategy: " + (error.response?.data?.message || error.message));
      console.log(error);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <Stack className={styles.container}>
      <Text variant="xLarge" className={styles.title}>Create Strategy</Text>
      
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
          label="Name"
          value={formData.name}
          onChange={handleTextChange('name')}
          required
          placeholder="Enter strategy name"
          autoComplete="off"
        />
        
        <TextField
          label="URL"
          value={formData.url}
          onChange={handleTextChange('url')}
          placeholder="Enter strategy URL"
          autoComplete="off"
          styles={{ root: { marginTop: '15px' } }}
        />
        
        <TextField
          label="Parameters"
          value={formData.parameters}
          onChange={handleTextChange('parameters')}
          placeholder="Enter strategy parameters"
          autoComplete="off"
          styles={{ root: { marginTop: '15px' } }}
        />
        
        <Checkbox
          label="Skip Checks Take Trade"
          checked={formData.skipChecksTakeTrade}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
        />
        
        <PrimaryButton
          text="Create Strategy"
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        />
      </form>
    </Stack>
  );
};

export default CreateStrategyForm;