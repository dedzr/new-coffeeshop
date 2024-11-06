const normalizePhoneNumber = (number) => {
    // Remove any non-digit characters

    let normalizedNumber = number.replace(/\D/g, '');
  
    // Check if the number starts with 88, remove it if so
    if (normalizedNumber.startsWith('880')) {
      normalizedNumber = normalizedNumber.slice(3); // Remove country code
    }
    
    // Check if the number starts with 0, remove it if so
    if (normalizedNumber.startsWith('0')) {
      normalizedNumber = normalizedNumber.slice(1); // Remove leading zero
    }
    
    // Return the number in the expected format
    return `0${normalizedNumber}`; // Ensure it has the correct leading zero
  };

module.exports=normalizePhoneNumber;