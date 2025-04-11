# Gunakan image Node.js resmi
FROM node:20-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Copy file package.json dan package-lock.json (atau pnpm-lock.yaml / yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Kalau pakai pnpm:
RUN npm install -g pnpm && pnpm install

# Salin semua file ke dalam container
COPY . .

# Expose port yang digunakan oleh app kamu (misalnya 3000)
EXPOSE 3000