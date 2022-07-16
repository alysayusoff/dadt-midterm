let sqlquery = "";
let joinAll = "FROM flat, address, street, town, type, model, resale_price, lease ";
joinAll += "WHERE flat.flatID = resale_price.resaleID ";
joinAll += "AND flat.leaseID = lease.leaseID ";
joinAll += "AND flat.addressID = address.addressID ";
joinAll += "AND address.streetID = street.streetID ";
joinAll += "AND street.townID = town.townID ";
joinAll += "AND flat.typeID = type.typeID ";
joinAll += "AND type.modelID = model.modelID ";

module.exports = function (app) {
    app.get("/", function (req, res) {
        res.render("index.html", {
            title: "Resale Flat Prices in Singapore"
        });
    });
    app.get("/budget", function (req, res) {
        sqlquery = "SELECT flatID, town_name, flat_type, floor_area_sqm, resale_price ";
        sqlquery += joinAll;
        // conditions
        if (req.query.budgetMin != "" && req.query.budgetMax != "") {
            sqlquery += "AND resale_price.resale_price <= " + req.query.budgetMax + " ";
            sqlquery += "AND resale_price.resale_price >= " + req.query.budgetMin + " ";
        }
        else if (req.query.budgetMin != "" && req.query.budgetMax == "") {
            sqlquery += "AND resale_price.resale_price >= " + req.query.budgetMin + " ";
        }
        else if (req.query.budgetMin == "" && req.query.budgetMax != "") {
            sqlquery += "AND resale_price.resale_price <= " + req.query.budgetMax + " ";
        }
        if (req.query.order != null) {
            sqlquery += "ORDER BY resale_price " + req.query.order + " ";
        }
        if (req.query.limit != "") {
            sqlquery += "LIMIT " + req.query.limit;
        }
        console.log(sqlquery)

        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect("/");
                console.log(err);
            } else {
                res.render("budget.html", {
                    title: "Resale Flat Prices in Singapore",
                    result: result,
                    min: req.query.budgetMin,
                    max: req.query.budgetMax
                });
            }
        });
    });
    app.get("/details", function (req, res) {
        sqlquery = "SELECT floor_area_sqm, block, street_name, town_name, flat_type, flat_model, resale_price, "
        sqlquery += "lease_commence_date, remaining_lease ";
        sqlquery += joinAll;
        // conditions
        if (req.query.flatID != null) {
            sqlquery += "AND flat.flatID = " + req.query.flatID + " ";
        } else {
            sqlquery += "AND town.town_name = '" + req.query.town_name + "' ";
            sqlquery += "AND resale_price.month = '" + req.query.month + "' ";
        }
        console.log(sqlquery);

        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect("/");
                console.log(err);
            } else {
                res.render("details.html", {
                    title: "Resale Flat Prices in Singapore",
                    result: result
                });
            }
        });
    });
    app.get("/average", function (req, res) {
        sqlquery = "SELECT town_name, month, AVG(resale_price) AS avg_resale_price, COUNT(*) as records ";
        sqlquery += joinAll;
        // conditions
        if (req.query.town != null) {
            sqlquery += "AND town.town_name = '" + req.query.town + "' ";
        }
        sqlquery += "GROUP BY town_name, month ORDER BY month ";
        console.log(sqlquery);

        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect("/");
                console.log(err);
            } else {
                res.render("average.html", {
                    title: "Resale Flat Prices in Singapore",
                    result: result,
                });
            }
        });
    });
    app.get("/compare", function (req, res) {
        sqlquery = "SELECT town_name, AVG(floor_area_sqm) as avg_floor, AVG(resale_price) as avg_resale, month, "
        sqlquery += "COUNT(*) AS numSales "
        sqlquery += joinAll;
        sqlorder = "GROUP BY town_name, month ORDER BY month ";
        
        // query 1
        sqlquery1 = sqlquery + "AND town.town_name = '" + req.query.town1 + "' " + sqlorder;
        // query 2
        sqlquery2 = sqlquery + "AND town.town_name = '" + req.query.town2 + "' " + sqlorder;
        console.log(sqlquery1);
        console.log(sqlquery2);

        db.query(sqlquery1, (err, result1) => {
            if (err) {
                res.redirect("/");
                console.log(err);
            } else {
                db.query(sqlquery2, (err, result2) => {
                    if (err) {
                        res.redirect("/");
                        console.log(err);
                    } else {
                        res.render("compare.html", {
                            title: "Resale Flat Prices in Singapore",
                            result1: result1,
                            result2: result2
                        });
                    }
                });
            }
        });
    });
}