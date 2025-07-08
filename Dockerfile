# Dockerfile simple pour NoteMaster
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./
COPY server/package*.json ./server/

# Installer les dépendances
RUN npm install
RUN cd server && npm install

# Copier le code source
COPY . .

# Build React app
RUN npm run build

# Exposer les ports
EXPOSE 3000 5000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Script de démarrage
COPY start-docker.sh ./
RUN chmod +x start-docker.sh

CMD ["./start-docker.sh"]
