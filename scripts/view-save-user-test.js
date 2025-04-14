const fs = require('fs');
const path = require('path');

const viewSavedUsers = () => {
    const filePath = path.join(__dirname, 'users.json');
  
    if (!fs.existsSync(filePath)) {
      console.log('❌ File users.json not found.');
      return;
    }
  
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(fileData);

    console.log(users[users.length - 1]);
    
};

viewSavedUsers()