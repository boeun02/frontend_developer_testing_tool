document.addEventListener("DOMContentLoaded", () => {
    // 포트 체크 요청
    document.getElementById("checkPort").addEventListener("click", () => {
        const ip = document.getElementById("ipInput").value;
        const port = document.getElementById("portInput").value;

        // IP 주소나 포트 번호가 비어 있는 경우, 경고 메시지 표시
        if (!ip && !port) {
            alert("IP 주소와 포트 번호를 입력해 주세요.");
            return;
        }

        if (!ip) {
            alert("IP 주소를 입력해 주세요.");
            return;
        }

        if (!port) {
            alert("포트 번호를 입력해 주세요.");
            return;
        }

        // 포트 상태 확인 API 호출
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
});


    document.getElementById("sendRequest").addEventListener("click", async function() {
        const method = document.getElementById("methodSelect").value;
        const url = document.getElementById("urlInput").value;
        const headers = document.querySelectorAll("#headersTable tbody tr");
        const headerObj = {};
    
        headers.forEach(row => {
            const key = row.querySelector(".headerKey").value;
            const value = row.querySelector(".headerValue").value;
            if (key && value) {
                headerObj[key] = value;
            }
        });
    
        const body = document.getElementById("jsonBody").value;
        let bodyObj = null;
    
        // URL 형식 검사
        try {
            new URL(url);
        } catch (_) {
            document.getElementById("responseOutput").innerText = "URL 형식이 잘못되었습니다. 올바른 URL을 입력하세요.";
            return;
        }
    
        if ((method === "POST" || method === "PUT") && !body) {
            alert("요청 본문이 필요합니다.");
            return;
        }
    
        if ((method === "POST" || method === "PUT") && body) {
            try {
                bodyObj = JSON.parse(body);
            } catch (e) {
                alert("JSON 형식이 잘못되었습니다.");
                return;
            }
        }
    
        if ((method === "GET" || method === "DELETE") && body) {
            alert("GET과 DELETE 요청에서는 본문을 포함할 수 없습니다.");
            return;
        }
    
        const requestData = {
            method: method,
            headers: headerObj,
            body: (method === "POST" || method === "PUT") ? JSON.stringify(bodyObj) : undefined,
            mode: 'cors',
        };
    
        try {
            const response = await fetch(url, requestData);
            const contentType = response.headers.get("content-type");
            let responseBody;
    
            if (response.ok) {
                if (contentType && contentType.includes("application/json")) {
                    responseBody = await response.json();
                } else {
                    responseBody = await response.text();
                }
                document.getElementById("responseOutput").innerText = JSON.stringify(responseBody, null, 2);
            } else {
                // 상태 코드 및 오류 메시지 출력
                try {
                    responseBody = await response.json();
                    document.getElementById("responseOutput").innerText = 
                        `요청 실패 - 상태 코드: ${response.status} ${response.statusText}\n` +
                        `에러 메시지: ${JSON.stringify(responseBody, null, 2)}`;
                } catch (error) {
                    responseBody = await response.text();
                    document.getElementById("responseOutput").innerText = 
                        `요청 실패 - 상태 코드: ${response.status} ${response.statusText}\n` +
                        `응답 내용: ${responseBody}`;
                }
            }
        } catch (error) {
            // 네트워크 오류와 URL 문제 구분
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                document.getElementById("responseOutput").innerText = "네트워크 오류가 발생했습니다. 서버가 응답하지 않습니다.";
            } else {
                document.getElementById("responseOutput").innerText = `네트워크 오류: ${error.message}`;
            }
        }
    });
    

    // PDF 저장 기능
    document.getElementById("pdfSave").addEventListener("click", () => {
        const element = document.body;
        html2pdf().from(element).save();
    });

    // 팩맨 게임 팝업
    document.getElementById("title").addEventListener("click", function () {
        window.open("pacman_game.html", "PacManGame", "width=400,height=400");
    });
    
