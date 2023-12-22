export PATH := $(GOPATH)/bin:$(PATH)
export GO111MODULE=on
LDFLAGS := -s -w

all: build

build: env CGO_ENABLED=0 go build -trimpath -ldflags "$(LDFLAGS)" -o bin/ai

css: tailwindcss -i input.css -o .\templates\static\css\index.css

clean:
	rm -rf ./bin