<?php
/**
 * Avisa a Bing y Yandex de que las URLs del sitio existen o han cambiado,
 * usando IndexNow. No hace falta cuenta ni verificación: basta con que el
 * fichero de la clave esté servido en la raíz del sitio.
 *
 * Importa porque Bing alimenta la búsqueda web de ChatGPT, así que esta es
 * la vía más corta desde "he publicado una página" hasta "un modelo puede
 * encontrarla".
 *
 * Ejecutar tras cada despliegue con contenido nuevo:
 *   & "C:\xampp\php\php.exe" bin\indexnow.php
 *
 * Las URLs se leen de sitemap.xml, así que no hay una segunda lista que
 * mantener: genera primero el sitemap y luego lanza esto.
 */

$clave = 'd8cff338b89b35a0342133a959a05940';
$host  = 'honestplugins.github.io';
$base  = 'https://' . $host;

$sitemap = __DIR__ . '/../sitemap.xml';
if ( ! is_readable( $sitemap ) ) {
	fwrite( STDERR, "No encuentro sitemap.xml. Ejecuta antes bin/gen-sitemap.php\n" );
	exit( 1 );
}

$xml = simplexml_load_file( $sitemap );
if ( false === $xml ) {
	fwrite( STDERR, "sitemap.xml no es XML válido.\n" );
	exit( 1 );
}

$urls = array();
foreach ( $xml->url as $u ) {
	$urls[] = (string) $u->loc;
}

if ( ! $urls ) {
	fwrite( STDERR, "El sitemap no tiene URLs.\n" );
	exit( 1 );
}

/* Comprobación previa: si el fichero de la clave no está servido, IndexNow
   rechaza el envío entero. Mejor detectarlo aquí que recibir un 403 opaco. */
$url_clave = "$base/$clave.txt";
$ctx       = stream_context_create( array( 'http' => array( 'timeout' => 15, 'ignore_errors' => true ) ) );
$servida   = @file_get_contents( $url_clave, false, $ctx );

if ( trim( (string) $servida ) !== $clave ) {
	fwrite( STDERR, "La clave no está servida en $url_clave todavía.\n" );
	fwrite( STDERR, "Sube el fichero y espera a que GitHub Pages despliegue.\n" );
	exit( 1 );
}

$cuerpo = wp_json_encode_compat(
	array(
		'host'        => $host,
		'key'         => $clave,
		'keyLocation' => $url_clave,
		'urlList'     => $urls,
	)
);

$ch = curl_init( 'https://api.indexnow.org/indexnow' );
curl_setopt_array(
	$ch,
	array(
		CURLOPT_POST           => true,
		CURLOPT_POSTFIELDS     => $cuerpo,
		CURLOPT_HTTPHEADER     => array( 'Content-Type: application/json; charset=utf-8' ),
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_TIMEOUT        => 30,
	)
);
$respuesta = curl_exec( $ch );
$codigo    = curl_getinfo( $ch, CURLINFO_RESPONSE_CODE );
curl_close( $ch );

printf( "Enviadas %d URLs a IndexNow.\n", count( $urls ) );
printf( "Respuesta HTTP: %d\n", $codigo );

/* 200 = aceptado. 202 = aceptado, clave pendiente de comprobar por su parte. */
if ( 200 === $codigo || 202 === $codigo ) {
	echo "Aceptado.\n";
	exit( 0 );
}

echo "Respuesta: $respuesta\n";
exit( 1 );

/**
 * json_encode sin depender de WordPress.
 *
 * @param mixed $datos Datos a codificar.
 * @return string
 */
function wp_json_encode_compat( $datos ) {
	return json_encode( $datos, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
}
