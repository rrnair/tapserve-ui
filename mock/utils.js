/**
 * A set of Helper routines for mocking service
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */


/**
 * Paginate the response
 * 
 * @param {*} array Data items to paginate
 * @param {*} page Current page no, starts at 1
 * @param {*} limit No of data items in the page, default o 10
 * @returns Paginated response
 */

function paginate(array, page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const items = array.slice(offset, offset + limit)
  return {
    items,
    total: array.length,
    page: Number(page),
    limit: Number(limit)
  }
}

module.exports = { paginate }
