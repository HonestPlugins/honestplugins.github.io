<?php
/**
 * Genera sitemap.xml a partir de los HTML que EXISTEN de verdad.
 *
 * Reejecutar SIEMPRE que se añada o quite una página o un idioma:
 *   & "C:\xampp\php\php.exe" bin\gen-sitemap.php
 *
 * Se genera en lugar de escribirse a mano justamente para que no acabe
 * listando páginas inexistentes: un sitemap con 404 dentro es peor que no
 * tener sitemap. Los alternos hreflang se deducen agrupando por nombre de
 * fichero, así que /es/entrepo.html se enlaza solo con /entrepo.html.
 */

$dir  = dirname( __DIR__ );
$base = 'https://honestplugins.github.io';

$rii   = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ) );
$paths = array();

foreach ( $rii as $file ) {
	if ( $file->isDir() || 'html' !== strtolower( $file->getExtension() ) ) {
		continue;
	}
	$rel = str_replace( '\\', '/', substr( $file->getPathname(), strlen( $dir ) + 1 ) );
	if ( 0 === strpos( $rel, 'bin/' ) ) {
		continue;
	}
	$paths[] = $rel;
}

sort( $paths );

/* Agrupa por nombre de fichero para emitir los alternos hreflang. */
$por_fichero = array();
foreach ( $paths as $p ) {
	$trozos  = explode( '/', $p );
	$fichero = array_pop( $trozos );
	$idioma  = $trozos ? $trozos[0] : 'en';
	$por_fichero[ $fichero ][ $idioma ] = $p;
}

$hoy = date( 'Y-m-d' );
$xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
	. "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"\n"
	. "        xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n";

foreach ( $paths as $p ) {
	$fichero = basename( $p );
	$prio    = ( 'index.html' === $p ) ? '1.0' : ( ( 'index.html' === $fichero ) ? '0.9' : '0.8' );

	$xml .= "  <url>\n";
	$xml .= "    <loc>$base/$p</loc>\n";
	foreach ( $por_fichero[ $fichero ] as $idioma => $ruta ) {
		$xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"$idioma\" href=\"$base/$ruta\"/>\n";
	}
	if ( isset( $por_fichero[ $fichero ]['en'] ) ) {
		$xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"$base/{$por_fichero[ $fichero ]['en']}\"/>\n";
	}
	$xml .= "    <lastmod>$hoy</lastmod>\n";
	$xml .= "    <priority>$prio</priority>\n";
	$xml .= "  </url>\n";
}

$xml .= "</urlset>\n";

file_put_contents( $dir . '/sitemap.xml', $xml );

printf( "sitemap.xml generado con %d URLs\n", count( $paths ) );
foreach ( $paths as $p ) {
	printf( "  %-24s idiomas: %s\n", $p, implode( ', ', array_keys( $por_fichero[ basename( $p ) ] ) ) );
}
