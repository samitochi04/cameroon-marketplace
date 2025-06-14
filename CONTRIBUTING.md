# Contributing Guide

## Branching Strategy

We follow the Git Flow workflow:

- `main`: Production code only, always deployable
- `develop`: Main development branch
- `feature/*`: For new features
- `bugfix/*`: For bug fixes
- `release/*`: For preparing releases
- `hotfix/*`: For critical production fixes

## Pull Request Process

1. Create your branch from `develop` (or `main` for hotfixes)
2. Follow the code style guidelines
3. Include tests where appropriate
4. Update documentation as needed
5. Ensure all tests pass before submitting PR
6. Request review from at least one team member