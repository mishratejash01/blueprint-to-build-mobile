-- Enable realtime for orders table so partners get instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE orders;