import { describe, it, expect } from '@jest/globals'
import { Vendor } from '@/types/vendor'
import { Category } from '@/types/category'
import { Contact, Phone, Address } from '@/types/contact'
import { Account, Bank } from '@/types/account'

/**
 * TYPES TESTS - Vendor Type Tests
 * 
 * This suite tests TypeScript type definitions and interfaces including:
 * - Type structure validation
 * - Required vs optional properties
 * - Type compatibility
 * - Interface relationships
 * - Type safety verification
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
describe('Types Tests - Vendor Type Tests', () => {
  
  describe('Vendor Interface Structure', () => {
    it('should have all required properties with correct types', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        description: 'Test description',
        category: {
          id: 'cat-1',
          name: 'Food Supplies',
          description: 'Food category',
          type: 'vendor',
          parentId: '',
          isActive: true,
          vendorCount: 1,
          expenseCount: 0,
          totalAmount: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'user-1'
        },
        expenseCount: 0,
        contact: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@testvendor.com',
          phone: [{
            phone: 1234567890,
            countryCode: 91
          }],
          address: {
            street: '123 Main St',
            city: 'BLR',
            state: 'KA',
            country: 'IN'
          }
        },
        imageUrls: [],
        isActive: true,
        totalAmount: 0,
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      // Type assertions to verify structure
      expect(typeof vendor.id).toBe('string')
      expect(typeof vendor.name).toBe('string')
      expect(typeof vendor.description).toBe('string')
      expect(typeof vendor.category).toBe('object')
      expect(typeof vendor.expenseCount).toBe('number')
      expect(typeof vendor.contact).toBe('object')
      expect(Array.isArray(vendor.imageUrls)).toBe(true)
      expect(typeof vendor.isActive).toBe('boolean')
      expect(typeof vendor.totalAmount).toBe('number')
      expect(typeof vendor.createdBy).toBe('string')
      expect(typeof vendor.createdAt).toBe('string')
      expect(typeof vendor.updatedAt).toBe('string')
    })

    it('should allow optional account property', () => {
      const vendorWithoutAccount: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        description: 'Test description',
        category: {
          id: 'cat-1',
          name: 'Food Supplies',
          description: 'Food category',
          type: 'vendor',
          parentId: '',
          isActive: true,
          vendorCount: 1,
          expenseCount: 0,
          totalAmount: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'user-1'
        },
        expenseCount: 0,
        contact: {
          firstName: 'Bob',
          lastName: 'B',
          email: 'bob@testvendor.com',
          phone: [{
            phone: 1234567890,
            countryCode: 91
          }],
          address: {
            street: '123 Main St',
            city: 'BLR',
            state: 'KA',
            country: 'IN'
          }
        },
        // account is optional - not included
        imageUrls: [],
        isActive: true,
        totalAmount: 0,
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(vendorWithoutAccount.accounts).toBeUndefined()
    })

    it('should allow vendor with account property', () => {
      const vendorWithAccount: Vendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        description: 'Test description',
        category: {
          id: 'cat-1',
          name: 'Food Supplies',
          description: 'Food category',
          type: 'vendor',
          parentId: '',
          isActive: true,
          vendorCount: 1,
          expenseCount: 0,
          totalAmount: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'user-1'
        },
        expenseCount: 0,
        contact: {
          firstName: 'James',
          lastName: 'J',
          email: 'james@testvendor.com',
          phone: [{
            phone: 1234567890,
            countryCode: 91
          }],
          address: {
            street: '123 Main St',
            city: 'BLR',
            state: 'KA',
            country: 'IN'
          }
        },
        accounts: [{
          id: 'acc-1',
          accountNo: '123456789',
          bank: {
            name: 'Test Bank',
            ifsc: 'TEST0001',
            accountType: 'current',
            txnMatchRule: 'test-rule',
            address: {
              street: 'Bank Street',
              city: 'BLR',
              state: 'KA',
              country: 'IN'
            }
          }
        }],
        imageUrls: [],
        isActive: true,
        totalAmount: 0,
        createdBy: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(vendorWithAccount.accounts).toBeDefined()
      expect(Array.isArray(vendorWithAccount.accounts)).toBe(true)
      expect(vendorWithAccount.accounts?.length).toBe(1)
      expect(typeof vendorWithAccount.accounts?.[0].id).toBe('string')
      expect(typeof vendorWithAccount.accounts?.[0].accountNo).toBe('string')
    })

    it('should handle empty arrays for imageUrls', () => {
      const vendor: Partial<Vendor> = {
        imageUrls: []
      }

      expect(Array.isArray(vendor.imageUrls)).toBe(true)
      expect(vendor.imageUrls?.length).toBe(0)
    })

    it('should handle populated imageUrls array', () => {
      const vendor: Partial<Vendor> = {
        imageUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.png',
          'https://example.com/image3.webp'
        ]
      }

      expect(Array.isArray(vendor.imageUrls)).toBe(true)
      expect(vendor.imageUrls?.length).toBe(3)
      expect(vendor.imageUrls?.every(url => typeof url === 'string')).toBe(true)
    })
  })

  describe('Category Interface Structure', () => {
    it('should have all required properties with correct types', () => {
      const category: Category = {
        id: 'cat-123',
        name: 'Food Supplies',
        description: 'All food related supplies',
        type: 'vendor',
        parentId: 'parent-cat-1',
        isActive: true,
        vendorCount: 5,
        expenseCount: 15,
        totalAmount: 2500.50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'user-1'
      }

      expect(typeof category.id).toBe('string')
      expect(typeof category.name).toBe('string')
      expect(typeof category.description).toBe('string')
      expect(typeof category.type).toBe('string')
      expect(typeof category.parentId).toBe('string')
      expect(typeof category.isActive).toBe('boolean')
      expect(typeof category.vendorCount).toBe('number')
      expect(typeof category.expenseCount).toBe('number')
      expect(typeof category.totalAmount).toBe('number')
      expect(typeof category.createdAt).toBe('string')
      expect(typeof category.updatedAt).toBe('string')
      expect(typeof category.createdBy).toBe('string')
    })

    it('should allow optional description', () => {
      const category: Category = {
        id: 'cat-123',
        name: 'Food Supplies',
        // description is optional
        type: 'vendor',
        parentId: 'parent-cat-1',
        isActive: true,
        vendorCount: 0,
        expenseCount: 0,
        totalAmount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'user-1'
      }

      expect(category.description).toBeUndefined()
    })

    it('should handle numeric properties correctly', () => {
      const category: Category = {
        id: 'cat-123',
        name: 'Test Category',
        type: 'vendor',
        parentId: '',
        isActive: true,
        vendorCount: 0,
        expenseCount: 0,
        totalAmount: 0.00,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'user-1'
      }

      expect(Number.isInteger(category.vendorCount)).toBe(true)
      expect(Number.isInteger(category.expenseCount)).toBe(true)
      expect(typeof category.totalAmount).toBe('number')
    })
  })

  describe('Contact Interface Structure', () => {
    it('should have correct structure with optional properties', () => {
      const contact: Contact = {
        firstName: 'Alice',
        lastName: 'Wonderland',
        email: 'alice@example.com',
        phone: [{
          phone: 1234567890,
          countryCode: 91
        }],
        address: {
          street: '123 Main St',
          city: 'BLR',
          state: 'KA',
          country: 'IN'
        }
      }

      expect(Array.isArray(contact.phone)).toBe(true)
      expect(typeof contact.address).toBe('object')
    })

    it('should allow empty contact with all optional properties', () => {
      const contact: Contact = {
        firstName: 'Bob',
        // lastName, phone, address, and email are optional
      }

      expect(contact.phone).toBeUndefined()
      expect(contact.address).toBeUndefined()
    })

    it('should handle multiple phone numbers', () => {
      const contact: Contact = {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
        phone: [
          { phone: 1234567890, countryCode: 91 },
          { phone: 9876543210, countryCode: 91 },
          { phone: 1234567, countryCode: 1 }
        ]
      }

      expect(contact.phone?.length).toBe(3)
      expect(contact.phone?.every(p => typeof p.phone === 'number')).toBe(true)
      expect(contact.phone?.every(p => typeof p.countryCode === 'number')).toBe(true)
    })
  })

  describe('Phone Interface Structure', () => {
    it('should have correct numeric properties', () => {
      const phone: Phone = {
        phone: 1234567890,
        countryCode: 91
      }

      expect(typeof phone.phone).toBe('number')
      expect(typeof phone.countryCode).toBe('number')
      expect(Number.isInteger(phone.phone)).toBe(true)
      expect(Number.isInteger(phone.countryCode)).toBe(true)
    })

    it('should handle different country codes', () => {
      const phones: Phone[] = [
        { phone: 1234567890, countryCode: 1 },   // US
        { phone: 1234567890, countryCode: 91 },  // India
        { phone: 1234567890, countryCode: 44 },  // UK
        { phone: 1234567890, countryCode: 81 }   // Japan
      ]

      phones.forEach(phone => {
        expect(typeof phone.phone).toBe('number')
        expect(typeof phone.countryCode).toBe('number')
      })
    })
  })

  describe('Address Interface Structure', () => {
    it('should have required properties', () => {
      const address: Address = {
        city: 'BLR',
        state: 'KA',
        country: 'IN'
      }

      expect(typeof address.city).toBe('string')
      expect(typeof address.state).toBe('string')
      expect(typeof address.country).toBe('string')
    })

    it('should allow all optional properties', () => {
      const address: Address = {
        head: 'Head Office',
        building: 'Tech Park Building',
        street: '123 Main Street',
        city: 'BLR',
        state: 'KA',
        country: 'IN'
      }

      expect(typeof address.head).toBe('string')
      expect(typeof address.building).toBe('string')
      expect(typeof address.street).toBe('string')
      expect(typeof address.city).toBe('string')
      expect(typeof address.state).toBe('string')
      expect(typeof address.country).toBe('string')
    })

    it('should handle minimal address with only required fields', () => {
      const minimalAddress: Address = {
        city: 'NYC',
        state: 'NY',
        country: 'US'
      }

      expect(minimalAddress.head).toBeUndefined()
      expect(minimalAddress.building).toBeUndefined()
      expect(minimalAddress.street).toBeUndefined()
      expect(minimalAddress.city).toBe('NYC')
      expect(minimalAddress.state).toBe('NY')
      expect(minimalAddress.country).toBe('US')
    })
  })

  describe('Account Interface Structure', () => {
    it('should have required properties with correct types', () => {
      const account: Account = {
        id: 'acc-123',
        accountNo: '1234567890',
      }

      expect(typeof account.id).toBe('string')
      expect(typeof account.accountNo).toBe('string')
    })

    it('should allow optional bank property', () => {
      const accountWithBank: Account = {
        id: 'acc-123',
        accountNo: '1234567890',
        bank: {
          name: 'ICICI Bank',
          ifsc: 'ICIC0001234',
          accountType: 'savings',
          txnMatchRule: 'vendor-payment-rule'
        },
      }

      expect(typeof accountWithBank.bank).toBe('object')
      expect(accountWithBank.bank?.name).toBe('ICICI Bank')
      expect(accountWithBank.bank?.ifsc).toBe('ICIC0001234')
    })
  })

  describe('Bank Interface Structure', () => {
    it('should have required properties', () => {
      const bank: Bank = {
        name: 'State Bank of India',
        ifsc: 'SBIN0001234',
        accountType: 'savings'
      }

      expect(typeof bank.name).toBe('string')
      expect(typeof bank.ifsc).toBe('string')
      expect(typeof bank.accountType).toBe('string')
    })

    it('should allow optional address', () => {
      const bankWithAddress: Bank = {
        name: 'HDFC Bank',
        ifsc: 'HDFC0001234',
        accountType: 'current',
        address: {
          street: 'MG Road',
          city: 'BLR',
          state: 'KA',
          country: 'IN'
        }
      }

      expect(typeof bankWithAddress.address).toBe('object')
      expect(bankWithAddress.address?.street).toBe('MG Road')
    })
  })

  describe('Type Relationships and Compatibility', () => {
    it('should create valid vendor with all nested types', () => {
      const completeVendor: Vendor = {
        id: 'vendor-complete',
        name: 'Complete Vendor Example',
        description: 'A vendor with all possible properties',
        category: {
          id: 'cat-food',
          name: 'Food & Beverages',
          description: 'All food and beverage suppliers',
          type: 'vendor',
          parentId: 'cat-root',
          isActive: true,
          vendorCount: 10,
          expenseCount: 25,
          totalAmount: 5000.75,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          createdBy: 'admin-user'
        },
        expenseCount: 8,
        contact: {
          firstName: 'vendorFirstName',
          lastName: 'vendorLastName',
          email: 'vendorfn@example.com',
          phone: [
            { phone: 9876543210, countryCode: 91 },
            { phone: 8765432109, countryCode: 91 }
          ],
          address: {
            head: 'Corporate Office',
            building: 'Business Tower',
            street: '456 Business District',
            city: 'MUM',
            state: 'MH',
            country: 'IN'
          }
        },
        accounts: [{
          id: 'acc-vendor-complete',
          accountNo: '1234567890123',
          bank: {
            name: 'Axis Bank',
            ifsc: 'UTIB0001234',
            accountType: 'savings',
            txnMatchRule: 'AXIS|1234567890123|VENDOR_PAYMENT',
            address: {
              street: 'Bank Street',
              city: 'MUM',
              state: 'MH', 
              country: 'IN'
            }
          },
        }],
        imageUrls: [
          'https://example.com/vendor-logo.png',
          'https://example.com/vendor-certificate.jpg'
        ],
        isActive: true,
        totalAmount: 12500.50,
        createdBy: 'admin-user',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-20T15:45:30Z'
      }

      // Verify all nested structures
      expect(completeVendor.category.name).toBe('Food & Beverages')
      expect(completeVendor.contact.phone?.length).toBe(2)
      expect(completeVendor.contact.address?.city).toBe('MUM')
      expect(completeVendor.accounts?.[0].bank?.name).toBe('Axis Bank')
      expect(completeVendor.accounts?.[0].bank?.address?.state).toBe('MH')
      expect(completeVendor.imageUrls.length).toBe(2)
    })

    it('should handle partial vendor objects', () => {
      const partialVendor: Partial<Vendor> = {
        name: 'Partial Vendor',
        isActive: false
      }

      expect(partialVendor.name).toBe('Partial Vendor')
      expect(partialVendor.isActive).toBe(false)
      expect(partialVendor.id).toBeUndefined()
    })

    it('should type-check vendor arrays', () => {
      const vendors: Vendor[] = [
        {
          id: 'v1',
          name: 'Vendor 1',
          description: 'First vendor',
          category: {
            id: 'cat-1',
            name: 'Category 1',
            type: 'vendor',
            parentId: '',
            isActive: true,
            vendorCount: 1,
            expenseCount: 0,
            totalAmount: 0,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            createdBy: 'user-1'
          },
          expenseCount: 0,
          contact: {
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice.smith@example.com',
          },
          imageUrls: [],
          isActive: true,
          totalAmount: 0,
          createdBy: 'user-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      expect(Array.isArray(vendors)).toBe(true)
      expect(vendors.length).toBe(1)
      expect(typeof vendors[0].id).toBe('string')
    })
  })

  describe('Type Safety Edge Cases', () => {
    it('should handle empty strings in required fields', () => {
      const vendor: Vendor = {
        id: '',
        name: '',
        description: '',
        imageUrls: [''],
        category: {
          id: '',
          name: '',
          type: '',
          parentId: '',
          isActive: false,
          vendorCount: 0,
          expenseCount: 0,
          totalAmount: 0,
          createdAt: '',
          updatedAt: '',
          createdBy: ''
        },
        expenseCount: 0,
        contact: {
          firstName: '',
          lastName: '',
          email: '',
          phone: [],
          address: {
            street: '',
            city: '',
            state: '',
            country: ''
          },
        },
        isActive: false,
        totalAmount: 0,
        createdBy: '',
        createdAt: '',
        updatedAt: ''
      }

      expect(typeof vendor.id).toBe('string')
      expect(vendor.id.length).toBe(0)
    })

    it('should handle zero values in numeric fields', () => {
      const category: Category = {
        id: 'cat-zero',
        name: 'Zero Category',
        type: 'vendor',
        parentId: '',
        isActive: true,
        vendorCount: 0,
        expenseCount: 0,
        totalAmount: 0.00,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'user-1'
      }

      expect(category.vendorCount).toBe(0)
      expect(category.expenseCount).toBe(0)
      expect(category.totalAmount).toBe(0)
    })

    it('should handle large numeric values', () => {
      const vendor: Partial<Vendor> = {
        expenseCount: 999999,
        totalAmount: 999999999.99
      }

      expect(typeof vendor.expenseCount).toBe('number')
      expect(typeof vendor.totalAmount).toBe('number')
      expect(vendor.expenseCount).toBeGreaterThan(100000)
      expect(vendor.totalAmount).toBeGreaterThan(100000000)
    })

    it('should handle special characters in string fields', () => {
      const vendor: Partial<Vendor> = {
        name: 'Café & Restaurant Supplies Ltd. (Müller & Sons)',
        description: 'Specializes in café equipment & supplies - 100% organic! @premium'
      }

      expect(vendor.name).toContain('&')
      expect(vendor.name).toContain('ü')
      expect(vendor.description).toContain('@')
      expect(vendor.description).toContain('%')
    })

    it('should handle very long string values', () => {
      const longDescription = 'A'.repeat(1000)
      const vendor: Partial<Vendor> = {
        description: longDescription
      }

      expect(vendor.description?.length).toBe(1000)
      expect(typeof vendor.description).toBe('string')
    })
  })

  describe('Date String Validation', () => {
    it('should accept ISO date strings', () => {
      const vendor: Partial<Vendor> = {
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-12-31T23:59:59.999Z'
      }

      expect(typeof vendor.createdAt).toBe('string')
      expect(typeof vendor.updatedAt).toBe('string')
      expect(new Date(vendor.createdAt!).getTime()).toBe(new Date(vendor.createdAt!).getTime())
      expect(new Date(vendor.updatedAt!).getTime()).toBe(new Date(vendor.updatedAt!).getTime())
    })

    it('should accept different date string formats', () => {
      const dateStrings = [
        '2024-01-01T00:00:00Z',
        '2024-01-01T00:00:00.000Z',
        '2024-01-01T00:00:00+00:00',
        '2024-01-01T05:30:00+05:30'
      ]

      dateStrings.forEach(dateStr => {
        const vendor: Partial<Vendor> = {
          createdAt: dateStr
        }
        expect(typeof vendor.createdAt).toBe('string')
        expect(isNaN(Date.parse(vendor.createdAt!))).toBe(false)
      })
    })
  })

  describe('Array Type Safety', () => {
    it('should handle empty phone arrays', () => {
      const contact: Contact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: []
      }

      expect(Array.isArray(contact.phone)).toBe(true)
      expect(contact.phone?.length).toBe(0)
    })

    it('should handle empty image URL arrays', () => {
      const vendor: Partial<Vendor> = {
        imageUrls: []
      }

      expect(Array.isArray(vendor.imageUrls)).toBe(true)
      expect(vendor.imageUrls?.length).toBe(0)
    })

    it('should validate phone number array elements', () => {
      const phones: Phone[] = [
        { phone: 1234567890, countryCode: 91 },
        { phone: 9876543210, countryCode: 1 }
      ]

      phones.forEach(phone => {
        expect(typeof phone.phone).toBe('number')
        expect(typeof phone.countryCode).toBe('number')
        expect(phone.phone).toBeGreaterThan(0)
        expect(phone.countryCode).toBeGreaterThan(0)
      })
    })

    it('should validate image URL array elements', () => {
      const imageUrls: string[] = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
        '/local/path/image3.gif'
      ]

      imageUrls.forEach(url => {
        expect(typeof url).toBe('string')
        expect(url.length).toBeGreaterThan(0)
      })
    })
  })
})