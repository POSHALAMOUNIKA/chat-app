body {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
  background: #f4f4f9;
}

#loginScreen {
  margin-top: 100px;
}

#chatScreen {
  max-width: 400px;
  margin: auto;
}

#messages {
  border: 1px solid #ccc;
  background: white;
  width: 100%;
  height: 300px;
  margin: 20px auto;
  padding: 10px;
  overflow-y: scroll;
  text-align: left;
  border-radius: 8px;
  box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
}

.input-area {
  display: flex;
  justify-content: center;
  gap: 10px;
}

input[type="text"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 70%;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
