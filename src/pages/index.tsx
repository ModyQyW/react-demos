import { memo } from 'react';
import { Navigate } from 'react-router-dom';

const Index = memo(() => <Navigate to="mine-sweeper" replace />);

export default Index;
