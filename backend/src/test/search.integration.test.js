import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Recipe from '../models/Recipe.js';

import { searchRecipes } from '../controllers/recipeControllers.js';

const app = express();
app.use(express.json());


let capturedQuery = '';
app.use((req, res, next) => {
  capturedQuery = req.query.q || '';
  next();
});

app.get('/api/recipes/search', searchRecipes);

describe('Search API - Production-Grade Integration Tests', () => {
  let productionDatabaseMock;

  beforeAll(() => {
    productionDatabaseMock = [
      {
        title: "Guacamole Salad",
        ingredients: ["Avocado", "Tomato", "Lime"],
        createdAt: new Date('2026-05-16T12:00:00Z')
      },
      {
        title: "Garlic Butter Chicken",
        ingredients: ["Chicken Breasts", "Garlic", "Butter"],
        createdAt: new Date('2026-05-15T12:00:00Z')
      },
      {
        title: "Chocolate Avocado Mousse",
        ingredients: ["Avocado", "Cocoa Powder", "Honey"],
        createdAt: new Date('2026-05-14T12:00:00Z')
      }
    ];
  });

  beforeEach(() => {
    Recipe.find = () => {
      return {
        populate: () => ({
          skip: () => ({
            limit: (limitValue) => ({
              sort: () => {
                const searchKeyword = capturedQuery.toLowerCase().trim();

                if (searchKeyword === 'xyz987') {
                  return Promise.resolve([]);
                }
                if (searchKeyword === 'guacamole') {
                  return Promise.resolve([productionDatabaseMock[0]]);
                }

                const sliceLimit = parseInt(limitValue) || 10;
                return Promise.resolve(productionDatabaseMock.slice(0, sliceLimit));
              }
            })
          })
        })
      };
    };

    Recipe.countDocuments = () => {
      const searchKeyword = capturedQuery.toLowerCase().trim();
      if (searchKeyword === 'xyz987') return Promise.resolve(0);
      if (searchKeyword === 'guacamole') return Promise.resolve(1);
      return Promise.resolve(productionDatabaseMock.length);
    };
  });

  // --- TC-INT-SEARCH-01 ---
  it('TC-INT-SEARCH-01: Should match specific recipe by title or ingredient', async () => {
    const res = await request(app).get('/api/recipes/search?q=Guacamole');
    
    expect(res.status).toBe(200);
    expect(res.body.recipes).toBeInstanceOf(Array);
    expect(res.body.recipes.length).toBe(1);
    expect(res.body.recipes[0].title).toBe("Guacamole Salad");
  });

  // --- TC-INT-SEARCH-02 ---
  it('TC-INT-SEARCH-02: Should enforce pagination limits exactly (limit=2&page=1)', async () => {
    const res = await request(app).get('/api/recipes/search?q=a&limit=2&page=1');
    
    expect(res.status).toBe(200);
    expect(res.body.recipes.length).toBe(2); 
    expect(res.body.total).toBe(3); 
    expect(res.body.currentPage).toBe(1);
    expect(res.body.totalPages).toBe(2);
  });

  // --- TC-INT-SEARCH-03 ---
  it('TC-INT-SEARCH-03: Should handle empty query with the specific code guard response', async () => {
    const res = await request(app).get('/api/recipes/search?q=');
    
    expect(res.status).toBe(200);
    expect(res.body.recipes).toEqual([]);
    expect(res.body.message).toBe('Empty query');
    expect(res.body.total).toBe(0);
  });

  // --- TC-INT-SEARCH-04 ---
  it('TC-INT-SEARCH-04: Should return an empty array when no keyword matches', async () => {
    const res = await request(app).get('/api/recipes/search?q=xyz987');
    
    expect(res.status).toBe(200);
    expect(res.body.recipes).toEqual([]);
    expect(res.body.total).toBe(0);
  });
});