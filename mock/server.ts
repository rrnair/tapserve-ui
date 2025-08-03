import express from 'express';
import cors from 'cors';
import categoriesRoute from './routes/categories';
import vendorsRoute from './routes/vendors';
import expensesRoute from './routes/expenses';
import expenseDashboardRoute from './routes/expenseDashboard';

/**
 * Standup a mock server (REST API) for dev. Mock with actual data and close to real-life data that is expected in the
 * production. This is not for unit testing rather this is for improving quality and smother development
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
const app = express();
const PORT = 3001;
const BASE_URL = "/api/v1"

app.use(cors());
app.use(express.json());

// Hande categories route - /categories
app.use(`${BASE_URL}/categories`, categoriesRoute);

// Hande vendors route - /vendors
app.use(`${BASE_URL}/vendors`, vendorsRoute);

// Handle dashboard route - /expenses/dashboard (must be before main expenses route)
app.use(`${BASE_URL}/expenses/dashboard`, expenseDashboardRoute);

// Hande expenses route - /expenses
app.use(`${BASE_URL}/expenses`, expensesRoute);

// Start express server
app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});
