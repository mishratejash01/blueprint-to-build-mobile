-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION accept_order(uuid) TO authenticated;