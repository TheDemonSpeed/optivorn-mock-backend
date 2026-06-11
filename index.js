import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabaseClient.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

//test route to check if we can connect to the database and fetch data from a table
app.get('/api/test-db', async (req, res) => {
  try {
    const tableName = req.query.table || 'test_items';
    const { data, error } = await supabase.from(tableName).select('*').limit(10);
    
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    
    // Send the data back to the browser!
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Example route demonstrating Supabase connectivity
// Uncomment and replace 'your_table_name' with a real table to test

/*
app.get('/api/data', async (req, res) => {
  try {
    const { data, error } = await supabase.from('test_items').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
*/

// POST route to handle form submissions from the Enquire page
app.post('/api/enquire', async (req, res) => {
  try {
    const { name, email, phone, appliance, volume, message } = req.body;
    
    // Insert into the 'enquiries' table in Supabase
    const { data, error } = await supabase
      .from('enquiries')
      .insert([
        { name, email, phone, appliance, volume, message }
      ])
      .select();
      
    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export the Express API for Vercel
export default app;
