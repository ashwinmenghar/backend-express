const express = require("express");
const fs = require("fs").promises;
const app = express();
const PORT = 8000;
const contactsFilePath = "contacts.json";

app.use(express.json());

async function fetchData() {
  try {
    const contacts = await fs.readFile(contactsFilePath, "utf8");
    return JSON.parse(contacts);
  } catch (error) {
    return [];
  }
}

async function storeContact(obj) {
  try {
    await fs.writeFile(contactsFilePath, JSON.stringify(obj, null, 2), "utf-8");
  } catch (error) {
    console.log(`Something went wrong ${error.message}`);
  }
}

app.post("/contact/add", async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  try {
    const data = await fetchData();
    const contact = data.find((e) => e.phone === phone);

    if (!contact) {
      data.push({ firstName, lastName, phone });
      storeContact(data);
      res.json({ success: true, message: "Contact added successfully" });
    } else {
      res.json({
        success: false,
        message: `Contact number already exists`,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/contacts", async (req, res) => {
  try {
    const data = await fetchData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/contact/search/:name", async function (req, res) {
  const keyWord = req.params.name.toLowerCase();
  let regex = /^[a-zA-Z]+$/;
  let isNumber = false;

  if (!regex.test(keyWord)) {
    isNumber = true;
  }

  try {
    const data = await fetchData();

    const filterData = data.filter((contact) => {
      if (!isNumber) {
        const firstName = contact.firstName.toLowerCase();
        const lastName = contact.lastName.toLowerCase();

        return firstName.includes(keyWord) || lastName.includes(keyWord);
      } else {
        const phone = contact.phone;
        return phone == keyWord;
      }
    });

    res.json({ success: true, filterData });
  } catch (error) {
    console.log(error.message);
  }
});

app.delete("/contact/delete/:keyword", async (req, res) => {
  const keyword = Number(req.params.keyword);
  
  try {
    const data = await fetchData();
    const index = data.findIndex((contact) => contact.phone === keyword);

    if(index !== -1) {
        data.splice(index, 1);
        storeContact(data);
        res.json({
            success: true,
            message: "Contact Delete Successfully"
        })

    }else {
        res.json({
            success: false,
            message: `Contact with this ${keyword} number does not exist`
        })
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
