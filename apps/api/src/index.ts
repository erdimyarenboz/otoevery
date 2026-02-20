import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`\n🚀 OtoEvery API running on port ${PORT}`);
    console.log(`   Health:     http://localhost:${PORT}/api/health`);
    console.log(`   Auth:       POST http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`   Admin:      http://localhost:${PORT}/api/v1/admin/*`);
    console.log(`   Company:    http://localhost:${PORT}/api/v1/company/*`);
    console.log(`   Driver:     http://localhost:${PORT}/api/v1/driver/*`);
    console.log(`   Service:    http://localhost:${PORT}/api/v1/service/*`);
    console.log();
});
