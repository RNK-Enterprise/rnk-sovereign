// Atlas (192.168.1.202), ~/rnk-sovereign, run via pm2. The rnkstudios-uk
// tunnel connector runs on this same box; its Public Hostname mapping points
// rnkstudios.uk / www at http://localhost:3005. (Port 3003 on atlas is
// occupied by the RNK Enterprise site — do not use it here.)
module.exports = {
  apps: [
    {
      name: "rnk-sovereign",
      script: "server/prod.ts",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3005",
        // Episode audio + signup data live outside the repo dir so deploys
        // never touch them. Create both with: mkdir -p ~/rnk-audio ~/rnk-data
        RNK_AUDIO_DIR: "/home/rnk/rnk-audio",
        RNK_DATA_DIR: "/home/rnk/rnk-data",
      },
      error_file: "/home/rnk/.pm2/logs/rnk-sovereign-error.log",
      out_file: "/home/rnk/.pm2/logs/rnk-sovereign-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
