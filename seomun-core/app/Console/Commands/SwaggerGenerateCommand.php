<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Yaml\Yaml;

class SwaggerGenerateCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'swagger:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Swagger documentation from OpenAPI YAML file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $yamlPath = resource_path('swagger/openapi.yml');
        $jsonPath = storage_path('api-docs/api-docs.json');
        $yamlOutputPath = storage_path('api-docs/api-docs.yaml');

        if (! File::exists($yamlPath)) {
            $this->error("OpenAPI YAML file not found at: {$yamlPath}");

            return 1;
        }

        try {
            // Read YAML file
            $yamlContent = File::get($yamlPath);

            // Parse YAML to array
            $data = Yaml::parse($yamlContent);

            // Convert to JSON
            $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            // Ensure directory exists
            File::ensureDirectoryExists(storage_path('api-docs'));

            // Write JSON file
            File::put($jsonPath, $jsonContent);

            // Also write YAML file for reference
            // File::put($yamlOutputPath, $yamlContent);

            $this->info('Swagger documentation generated successfully!');
            $this->info("JSON: {$jsonPath}");
            $this->info("YAML: {$yamlOutputPath}");

            return 0;
        } catch (\Exception $e) {
            $this->error('Error generating Swagger documentation: '.$e->getMessage());

            return 1;
        }
    }
}
