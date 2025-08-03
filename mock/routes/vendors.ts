// mock/routes/vendors.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import {Vendor} from '../../src/types/vendor';

/**
 * Vendor mock routes and handlers for vendor
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
const router = Router();
const dataFile = path.resolve(__dirname, '../data/vendors.json');

const loadData = () => {
  const raw = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw) as Vendor[];
};

const saveData = (data: any[]) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// GET /api/v1/vendors
router.get('/', (req, res) => {
  console.log(`Get all vendors ${JSON.stringify(req.query)}`)
  const { page = '1', limit = '10', search = '' } = req.query;
  const all = loadData();

  const filtered = all.filter(cat =>
    cat.name.toLowerCase().includes((search as string).toLowerCase())
  );

  const pageNum = parseInt(page as string, 10);
  const pageLimit = parseInt(limit as string, 10);
  const start = (pageNum - 1) * pageLimit;
  const paginated = filtered.slice(start, start + pageLimit);

  res.json({
    success: true,
    data: {
      items: paginated,
      total: filtered.length,
      page: pageNum,
      limit: pageLimit
    }
  });
});

// POST /api/v1/vendors
router.post('/', (req, res) => {
  console.log(`POST: Create vendors request: ${req.body}`);
  const all = loadData();

  // Fill up default fields
  const newVendor = { 
    id: uuid(), vendorCount: 0,
    expenseCount: 0,
    totalAmount: 0, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    ...req.body 
  } as Vendor;

  all.push(newVendor);
  saveData(all);
  res.status(201).json({ success: true, data: newVendor });
});

// PUT /api/v1/vendors/:id
router.put('/:id', (req, res) => {
  console.log(`PUT: vendors request: ${req.body}`);
  const all = loadData();
  const index = all.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
  all[index] = { ...all[index], ...req.body };
  saveData(all);
  res.json({ success: true, data: all[index] });
});

// DELETE /api/v1/vendors/:id
router.delete('/:id', (req, res) => {
  let all = loadData();
  const index = all.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
  const deleted = all.splice(index, 1)[0];
  saveData(all);
  res.json({ success: true, data: deleted });
});

export default router;
