## fragment 与 innerHTML

## fragment 例子

    const list = document.querySelector('#list');
    const fruits = ['Apple', 'Orange', 'Banana', 'Melon'];

    const fragment = document.createDocumentFragment();

    fruits.forEach(fruit => {
    const li = document.createElement('li');
    li.innerHTML = fruit;
    fragment.appendChild(li);
    });

    list.appendChild(fragment);

## innerHTML

    会直接把字符串解析为 dom

## git change in vscode
