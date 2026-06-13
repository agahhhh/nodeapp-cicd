MARKDOWN 
<!-- README.md -->
# nodeapp-cicd
 
<!-- Pipeline status badges -->
![CI/CD Pipeline](https://github.com/kamzysert3/nodeapp-cicd/actions/workflows/ci-cd.yml/badge.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Deployed](https://img.shields.io/badge/deployed-FTP-blue)
![Tests](https://img.shields.io/badge/tests-Jest-orange)
 
A production-ready Node.js application with a full CI/CD pipeline.
 
## Pipeline
| Stage | Tool | Trigger |
|-------|------|---------|
| Lint | ESLint | Every push |
| Test | Jest + Supertest | Every push |
| Security | npm audit | Every push |
| Deploy | FTP Deploy Action | Push to main only |
| Verify | curl smoke test | Push to main only |

## Quick Start
```bash
npm install
npm test
npm start
```

## Live
http://raymond.vudse26.cloud/nodeapp-cicd/