document.addEventListener("DOMContentLoaded", () => {
    // 포트 체크 요청
    document.getElementById("checkPort").addEventListener("click", () => {
        const ip = document.getElementById("ipInput").value;
        const port = document.getElementById("portInput").value;

        fetch(`http://localhost:8080/checkPort?ip=${ip}&port=${port}`, {
            method: 'GET',
            mode: 'cors'
        })
            .then(response => response.text())
            .then(result => {
                document.getElementById("portStatus").innerText = result;
            })
            .catch(() => {
                document.getElementById("portStatus").innerText = "포트를 확인할 수 없습니다.";
            });
    });

// API 테스트 버튼 클릭 이벤트 리스너
document.getElementById("sendRequest").addEventListener("click", async function() {
    const method = document.getElementById("methodSelect").value; // 선택된 HTTP 메서드 (GET, POST, PUT, DELETE)
    const url = document.getElementById("urlInput").value; // 입력된 요청 URL
    const headers = document.querySelectorAll("#headersTable tbody tr"); // 입력된 헤더 값들
    const headerObj = {}; // 헤더 객체 초기화

    // 입력된 헤더 값들을 객체로 변환
    headers.forEach(row => {
        const key = row.querySelector(".headerKey").value;
        const value = row.querySelector(".headerValue").value;
        if (key && value) {
            headerObj[key] = value; // key-value 쌍이 있는 경우만 추가
        }
    });

    const body = document.getElementById("jsonBody").value; // 요청 본문(JSON 형식으로 입력)
    let bodyObj = null; // 본문 객체 초기화

    // POST와 PUT 요청에 본문이 필요한지 확인
    if ((method === "POST" || method === "PUT") && !body) {
        alert("요청 본문이 필요합니다."); // 본문이 없으면 경고 후 종료
        return;
    }

    // POST나 PUT에서 본문이 있는 경우 JSON 형식 확인
    if ((method === "POST" || method === "PUT") && body) {
        try {
            bodyObj = JSON.parse(body); // JSON 파싱 시도
        } catch (e) {
            alert("JSON 형식이 잘못되었습니다."); // JSON 형식 오류 시 경고 후 종료
            return;
        }
    }

    // GET과 DELETE 요청에서 본문이 포함되지 않도록 설정
    if ((method === "GET" || method === "DELETE") && body) {
        alert("GET과 DELETE 요청에서는 본문을 포함할 수 없습니다."); // 본문 포함 시 경고 후 종료
        return;
    }

    // 요청 데이터 객체 생성
    const requestData = {
        method: method, // 요청 메서드 설정 (GET, POST 등)
        headers: headerObj, // 헤더 설정
        body: (method === "POST" || method === "PUT") ? JSON.stringify(bodyObj) : undefined, // POST, PUT 요청에만 본문 추가
        mode: 'cors', // CORS 모드 설정
    };

    try {
        // API 요청 보내기
        const response = await fetch(url, requestData);

        const contentType = response.headers.get("content-type"); // 응답 Content-Type 확인
        let responseBody;

        // 응답이 성공적인 경우
        if (response.ok) {
            // JSON 응답일 경우 JSON으로 파싱, 그렇지 않으면 텍스트로 처리
            if (contentType && contentType.includes("application/json")) {
                responseBody = await response.json(); // JSON 응답 파싱
            } else {
                responseBody = await response.text(); // 텍스트 응답으로 처리
            }
            // 응답 내용을 화면에 출력
            document.getElementById("responseOutput").innerText = JSON.stringify(responseBody, null, 2);
        } else {
            // 실패 시 상태 코드와 에러 메시지 출력
            try {
                // JSON 에러 응답 파싱
                responseBody = await response.json();
                document.getElementById("responseOutput").innerText = `Request failed with status: ${response.status}\n` + 
                    `Error message: ${JSON.stringify(responseBody, null, 2)}`;
            } catch (error) {
                // JSON이 아닌 응답일 경우 텍스트로 처리
                responseBody = await response.text();
                document.getElementById("responseOutput").innerText = `Request failed with status: ${response.status}\n` + 
                    `Response: ${responseBody}`;
            }
        }
    } catch (error) {
        // 네트워크 또는 요청 자체에 실패했을 경우 에러 메시지 출력
        document.getElementById("responseOutput").innerText = "요청에 실패했습니다. 에러: " + error.message;
    }
});

    // PDF 저장 기능
    document.getElementById("pdfSave").addEventListener("click", () => {
        const element = document.body;
        html2pdf().from(element).save();
    });
});