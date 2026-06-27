

using FluentFTP;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using System.IO.Compression;
namespace MVA_FOOD.API.Services
{
    public class FtpStorageService
    {
        private readonly IConfiguration _configuration;
        public FtpStorageService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        private FtpClient CreateClient()
        {
            var host = _configuration["FTP:Host"];
            var username = _configuration["FTP:Username"];
            var password = _configuration["FTP:Password"];
            var client = new FtpClient(host)
            {
                Credentials = new System.Net.NetworkCredential(username, password),
                Port = int.Parse(_configuration["FTP:Port"] ?? "21")
            };
            Console.WriteLine($"host: {host}");
            client.Connect();
            return client;
        }
        public async Task<string> UploadImageAsync(
        Stream fileStream,
        string folder,
        string fileName)
        {
            const int maxWidth = 1280;

            using var client = CreateClient();

            var directory = $"/{folder}";

            EnsureDirectory(client, directory);

            var webpFileName = Path.ChangeExtension(fileName, ".webp");

            var remotePath = $"{directory}/{webpFileName}";

            using var image = await Image.LoadAsync(fileStream);

            if (image.Width > maxWidth)
            {
                image.Mutate(x =>
                    x.Resize(new ResizeOptions
                    {
                        Mode = ResizeMode.Max,
                        Size = new Size(maxWidth, 0)
                    }));
            }

            using var webpStream = new MemoryStream();

            await image.SaveAsync(
                webpStream,
                new WebpEncoder
                {
                    Quality = 65,
                    Method = WebpEncodingMethod.BestQuality
                });

            webpStream.Position = 0;

            client.UploadStream(
                webpStream,
                remotePath,
                FtpRemoteExists.Overwrite,
                true);

            return BuildFileUrl(folder, webpFileName);
        }
        public Task DeleteFileAsync(string folder, string fileName)
        {
            using var client = CreateClient();

            folder = folder.Trim('/');

            fileName = Path.GetFileName(fileName); // 🔥 elimina rutas

            var remotePath = $"/{folder}/{fileName}";

            if (client.FileExists(remotePath))
            {
                client.DeleteFile(remotePath);
            }

            return Task.CompletedTask;
        }
        private string BuildFileUrl(
            string folder,
            string fileName)
        {
            var baseUrl = _configuration["Ftp:UrlBase"]?.TrimEnd('/');

            return $"{baseUrl}/{folder}/{fileName}";
        }
        private void EnsureDirectory(FtpClient client, string directory)
        {
            if (!client.DirectoryExists(directory))
            {
                client.CreateDirectory(directory);
            }
        }
    }
}