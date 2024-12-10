# Bookstore API

이 프로젝트는 Node.js와 Express를 사용하여 구축된 웹 애플리케이션입니다. 이 애플리케이션은 사용자, 책, 좋아요, 카트, 주문에 대한 RESTful API를 제공합니다.

## 프로젝트 구조

* `routes`: Express Router를 사용하여 구현된 각 기능에 대한 라우터들이 포함되어 있습니다.
	+ `users.js`: 사용자 관련 API
	+ `books.js`: 책 관련 API
	+ `likes.js`: 좋아요 관련 API
	+ `carts.js`: 카트 관련 API
	+ `orders.js`: 주문 관련 API
* `app.js`: 애플리케이션의 시작점으로, 각 라우터를 애플리케이션에 연결합니다.

## 실행 방법

1. 프로젝트 디렉터리에서 `node app.js` 명령어를 실행하여 애플리케이션을 시작합니다.
2. 웹 브라우저 또는 API 클라이언트를 사용하여 `http://localhost:3000`에 접근하여 API를 테스트할 수 있습니다.

## API 문서

각 라우터 파일에 포함된 주석을 통해 API의 엔드포인트, 메서드, 응답 형식 등을 확인할 수 있습니다.
