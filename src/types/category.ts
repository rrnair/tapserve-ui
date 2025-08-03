/**
 * A category helps in grouping expenses together. For now the category is of type "vendor". A category can 
 * be "Poultry", "Diary", "Fresh market" etc
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface Category {
    // Unique identifier
    id: string,

    // Name of the category
    name: string,

    // Description of category
    description?: string,

    // Type - for now its "vendor"
    type: string,

    // Parent category for nesting
    parentId: string,

    // Is the category active
    isActive: boolean,

    // Total vendor count under this category
    vendorCount: number,

    // Total expenses paid under this category
    expenseCount: number,

    // Total amount paid under this category
    totalAmount: number,

    // When its created
    createdAt: string,

    // When its updated
    updatedAt: string,
    
    // Who created
    createdBy?: string
}

