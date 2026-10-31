<?php

namespace App\Services\Hanjin;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HanjinApiClient
{
    public function __construct(
        protected HanjinStatusMapper $mapper
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getAuthorization(): array
    {
        $clientId = (string) config('services.hanjin.client_id');
        $xApiKey = (string) config('services.hanjin.x_api_key');
        $authUrl = (string) config('services.hanjin.auth_url');
        $secret = (string) config('services.hanjin.hmac_secret');

        if ($clientId === '' || $xApiKey === '' || $secret === '' || $authUrl === '') {
            throw new \RuntimeException('Hanjin API credentials are not configured.');
        }

        $timestamp = now()->format('YmdHis');
        $signature = $this->sign($timestamp, $secret);

        $response = Http::withHeaders([
            'client_id' => $clientId,
            'x-api-key' => $xApiKey,
        ])
            ->timeout((int) config('services.hanjin.timeout', 15))
            ->connectTimeout((int) config('services.hanjin.connect_timeout', 5))
            ->withBody('', 'application/json')
            ->post($authUrl);

        if ($response->failed()) {
            throw new \RuntimeException('Hanjin HMAC auth failed: HTTP '.$response->status());
        }

        $body = $response->json();
        $authorization = $body['Authorization'] ?? null;

        if (! is_string($authorization) || $authorization === '') {
            throw new \RuntimeException('Hanjin HMAC auth returned empty Authorization header.');
        }

        return [
            'Authorization' => $authorization,
            'signature' => $signature,
            'timestamp' => $timestamp,
        ];
    }

    public function getTracking(string $invoiceNumber): HanjinTrackingResult
    {
        $auth = $this->getAuthorization();
        $custEdiCd = (string) config('services.hanjin.cust_edi_cd');
        $xApiKey = (string) config('services.hanjin.x_api_key');
        $url = (string) config('services.hanjin.tracking_url');
        try {
            $response = Http::withHeaders([
                'Authorization' => $auth['Authorization'],
                'x-api-key' => $xApiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout((int) config('services.hanjin.timeout', 15))
                ->connectTimeout((int) config('services.hanjin.connect_timeout', 5))
                ->post($url, [
                    'custEdiCd' => $custEdiCd,
                    'wblNo' => $invoiceNumber,
                ]);
        } catch (ConnectionException $e) {
            Log::warning('Hanjin tracking connection failed', [
                'invoice_number' => $invoiceNumber,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        if ($response->failed()) {
            throw new RequestException($response);
        }

        $payload = $response->json() ?? [];

        return $this->parseResponse($invoiceNumber, $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function parseResponse(string $invoiceNumber, array $payload): HanjinTrackingResult
    {
        $resultCode = $payload['resultCode'] ?? null;

        if ($resultCode !== 'OK') {
            return new HanjinTrackingResult(
                invoiceNumber: $invoiceNumber,
                latestStatusCode: null,
                latestStatusName: null,
                latestStatusAt: null,
                isTerminal: false,
                history: [],
                raw: $payload,
                resultCode: $resultCode,
                resultMessage: $payload['resultMessage'] ?? null,
            );
        }

        $historyRaw = is_array($payload['wrkList'] ?? null) ? $payload['wrkList'] : [];

        $history = [];
        $latest = null;
        $latestAt = null;
        $latestCode = null;
        $latestName = null;

        foreach ($historyRaw as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $statusAt = $this->mapper->parseStatusDate($entry);
            $history[] = [
                'status_code' => isset($entry['statusCode']) ? (string) $entry['statusCode'] : null,
                'status_name' => $entry['statusName'] ?? null,
                'status_date' => $statusAt?->format('Y-m-d H:i:s'),
                'agency_name' => $entry['agencyName'] ?? null,
                'agency_tel' => $entry['agencyTel'] ?? null,
                'worker_name' => $entry['workerName'] ?? null,
                'worker_tel' => $entry['workerTel'] ?? null,
                'reason_code' => $entry['reasonCode'] ?? null,
                'reason_message' => $entry['reasonMessage'] ?? null,
                'description' => $entry['description'] ?? null,
            ];

            if ($latestAt === null || ($statusAt !== null && $statusAt > $latestAt)) {
                $latestAt = $statusAt;
                $latestCode = isset($entry['statusCode']) ? (string) $entry['statusCode'] : null;
                $latestName = $entry['statusName'] ?? null;
                $latest = $entry;
            }
        }

        return new HanjinTrackingResult(
            invoiceNumber: $invoiceNumber,
            latestStatusCode: $latestCode,
            latestStatusName: is_string($latestName) ? $latestName : null,
            latestStatusAt: $latestAt,
            isTerminal: $this->mapper->isTerminal($latestCode),
            history: $history,
            raw: $payload,
            resultCode: $resultCode,
            resultMessage: $payload['resultMessage'] ?? null,
        );
    }

    protected function sign(string $timestamp, string $secret): string
    {
        return hash_hmac('sha256', $timestamp, $secret);
    }
}
