<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page {
    size: {{ $widthPt }}pt {{ $heightPt }}pt;
    margin: 0;
    padding: 0;
  }
  html, body {
    width: {{ $widthPt }}pt;
    height: {{ $heightPt }}pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
    overflow: hidden;
  }
  .print-page {
    width: {{ $widthPt }}pt;
    height: {{ $heightPt }}pt;
    position: relative;
    overflow: hidden;
  }
  img {
    width: 100%;
    height: 100%;
    display: block;
    border: none;
    margin: 0;
    padding: 0;
  }
</style>
</head>
<body>
{!! $body !!}
</body>
</html>
