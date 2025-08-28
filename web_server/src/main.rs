// src/main.rs

use actix_multipart::Multipart;
use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use futures_util::StreamExt as _;
use image::{ImageOutputFormat};
use std::io::Cursor;
use actix_cors::Cors;
use actix_web::{http::header};

#[post("/filter")]
async fn filter(mut payload: Multipart) -> impl Responder {
    // Extract bytes from multipart form data
    let mut bytes = web::BytesMut::new();

    while let Some(field) = payload.next().await {
        let mut field = field.unwrap();
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            bytes.extend_from_slice(&data);
        }
    }

    // Load image from bytes
    let img = image::load_from_memory(&bytes);

    if let Ok(mut img) = img {
        img = img.grayscale();

        // Convert image to PNG bytes
        let mut buf = Vec::new();
        img.write_to(&mut Cursor::new(&mut buf), ImageOutputFormat::Png).unwrap();

        return HttpResponse::Ok()
            .content_type("image/png")
            .body(buf);
    }

    HttpResponse::BadRequest().body("Invalid image data")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting server on http://127.0.0.1:8080");
    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost:3000") // React dev server origin
                    .allowed_methods(vec!["POST", "GET"])
                    .allowed_headers(vec![header::CONTENT_TYPE, header::AUTHORIZATION])
                    .max_age(3600),
            )
            .service(filter)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

